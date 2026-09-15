-- PromosNow: first persistent schema. Apply once to the selected project.
begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy admin_self on public.admin_users for select to authenticated using(user_id=auth.uid());
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
revoke all on function private.is_admin() from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.categories(slug text primary key, name text not null);
insert into public.categories values ('tecnologia','Tecnologia'),('casa','Casa'),('cozinha','Cozinha'),('bem-estar','Bem-estar');
create table public.products(
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 3 and 180),
 provider text not null check(provider in ('manual','mercado_livre')), external_id text,
 canonical_url text not null, image_url text, category text not null references public.categories(slug),
 current_price_cents bigint not null check(current_price_cents between 1 and 100000000),
 availability text not null default 'available' check(availability in ('available','unavailable','unknown')),
 checked_at timestamptz not null default now(), created_at timestamptz not null default now(),
 unique(provider,external_id), check(provider<>'mercado_livre' or (external_id is not null and external_id ~ '^MLB[0-9]+$'))
);
create unique index products_manual_url on public.products(canonical_url) where provider='manual';
create table public.price_history(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 price_cents bigint not null check(price_cents between 1 and 100000000), observed_at timestamptz not null default now(),
 observation_key uuid not null default gen_random_uuid(), unique(product_id, observation_key)
);
create index price_history_product on public.price_history(product_id,observed_at desc);
create table public.offers(
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 slug text not null unique, title text not null check(length(title) between 3 and 180), description text not null default '' check(length(description)<=2000),
 price_cents bigint not null check(price_cents between 1 and 100000000), reference_price_cents bigint,
 reference_basis text, status text not null default 'draft' check(status in ('draft','published','expired')),
 expires_at timestamptz not null, approved_by uuid references auth.users(id), approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(reference_price_cents is null or (reference_price_cents>price_cents and reference_price_cents<=100000000 and reference_basis is not null and length(trim(reference_basis))>0)),
 check(status<>'published' or (approved_by is not null and approved_at is not null))
);
create unique index offers_one_published on public.offers(product_id) where status='published';
create index offers_state on public.offers(status,expires_at);
create table public.affiliate_links(
 id uuid primary key default gen_random_uuid(), offer_id uuid not null unique references public.offers(id),
 code text not null unique default replace(gen_random_uuid()::text,'-',''), destination_url text not null,
 active boolean not null default true, created_at timestamptz not null default now()
);
create table public.telegram_publications(
 id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.offers(id), channel_id text not null,
 message_text text not null check(length(message_text)<=4096), status text not null default 'processing' check(status in ('processing','sent','failed','unknown')),
 lease_token uuid not null default gen_random_uuid(), telegram_message_id text, error_code text,
 created_at timestamptz not null default now(), finished_at timestamptz,
 unique(offer_id,channel_id), check(status<>'sent' or telegram_message_id is not null)
);
create table public.click_daily_counts(
 affiliate_link_id uuid not null references public.affiliate_links(id), day date not null default (now() at time zone 'UTC')::date,
 source text not null check(source in ('site','telegram','unknown')), click_count bigint not null default 0 check(click_count>=0),
 primary key(affiliate_link_id,day,source)
);
create table private.click_buckets(key text primary key, expires_at timestamptz not null);

-- The API cannot write raw tables, even with an administrator's session.
-- All writes below check membership in the database and use transactions.
do $$ declare t text; begin
 foreach t in array array['categories','products','price_history','offers','affiliate_links','telegram_publications','click_daily_counts'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy admin_read on public.%I for select to authenticated using(private.is_admin())',t);
 end loop;
end $$;

create function private.eligible(p_offer uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.offers o join public.products p on p.id=o.product_id join public.affiliate_links l on l.offer_id=o.id
 where o.id=p_offer and o.status='published' and o.expires_at>now() and l.active and p.availability='available'
 and p.checked_at>now()-interval '24 hours' and p.current_price_cents=o.price_cents)
$$;
revoke all on function private.eligible(uuid) from public,anon,authenticated;

create function public.catalog(p_slug text default null, p_limit int default 100, p_offset int default 0) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]'::jsonb) from (
 select o.id,o.slug,o.title,o.description,o.price_cents,o.reference_price_cents,o.reference_basis,o.status,o.expires_at,
 p.category,p.image_url,p.provider,p.checked_at,l.code
 from public.offers o join public.products p on p.id=o.product_id join public.affiliate_links l on l.offer_id=o.id
 where private.eligible(o.id) and (p_slug is null or o.slug=p_slug)
 order by o.created_at desc limit least(greatest(p_limit,1),100) offset greatest(p_offset,0)
 ) x
$$;
revoke all on function public.catalog(text,int,int) from public,anon,authenticated;
grant execute on function public.catalog(text,int,int) to anon,authenticated;

create function public.save_offer(payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare oid uuid; pid uuid; price bigint; ref bigint; dest text; shop text; image text; v_provider text; ext text;
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 price:=(payload->>'price_cents')::bigint; ref:=nullif(payload->>'reference_price_cents','')::bigint;
 dest:=payload->>'destination_url'; shop:=payload->>'canonical_url'; image:=nullif(payload->>'image_url','');
 v_provider:=payload->>'provider'; ext:=case when v_provider='manual' then null else nullif(payload->>'external_id','') end;
 -- Exact host boundaries, HTTPS only, no credentials, ports or control characters.
 if dest is null or shop is null or dest !~ '^https://(www\.)?(mercadolivre\.com\.br|produto\.mercadolivre\.com\.br|mercadolivre\.com|meli\.la)/[^[:space:][:cntrl:]]*$'
 or shop !~ '^https://(www\.)?(mercadolivre\.com\.br|produto\.mercadolivre\.com\.br)/[^[:space:][:cntrl:]]*$'
 then raise exception 'invalid_url'; end if;
 if image is not null and image !~ '^https://http2\.mlstatic\.com/[^[:space:][:cntrl:]]+$' then raise exception 'invalid_image'; end if;
 if payload->>'expires_at' is null or (payload->>'expires_at')::timestamptz <= now() or (payload->>'expires_at')::timestamptz > now()+interval '30 days' then raise exception 'invalid_expiry'; end if;
 oid:=nullif(payload->>'id','')::uuid;
 if oid is not null then
 select product_id into pid from public.offers where id=oid and status='draft' for update;
 if pid is null then raise exception 'edit_draft_only'; end if;
 else
 if v_provider='mercado_livre' then select id into pid from public.products where products.provider=v_provider and external_id=ext; end if;
 if v_provider='manual' then select id into pid from public.products where products.provider='manual' and canonical_url=shop; end if;
 end if;
 if pid is null then
 insert into public.products(title,provider,external_id,canonical_url,image_url,category,current_price_cents)
 values(payload->>'title',v_provider,ext,shop,image,payload->>'category',price) returning id into pid;
 else
 perform 1 from public.products where id=pid for update;
 -- A new draft must not modify a different published offer's product.
 if exists(select 1 from public.offers where product_id=pid and status='published') then raise exception 'archive_published_first'; end if;
 update public.products set provider=v_provider,external_id=ext,title=payload->>'title',canonical_url=shop,image_url=image,category=payload->>'category',
 current_price_cents=price,availability='available',checked_at=now() where id=pid;
 end if;
 insert into public.price_history(product_id,price_cents) values(pid,price);
 if oid is null then
 oid:=gen_random_uuid();
 insert into public.offers(id,product_id,slug,title,description,price_cents,reference_price_cents,reference_basis,expires_at)
 values(oid,pid,'oferta-'||replace(oid::text,'-',''),payload->>'title',payload->>'description',price,ref,nullif(payload->>'reference_basis',''),(payload->>'expires_at')::timestamptz);
 insert into public.affiliate_links(offer_id,destination_url) values(oid,dest);
 else
 update public.offers set title=payload->>'title',description=payload->>'description',price_cents=price,
 reference_price_cents=ref,reference_basis=nullif(payload->>'reference_basis',''),expires_at=(payload->>'expires_at')::timestamptz,updated_at=now() where id=oid;
 update public.affiliate_links set destination_url=dest where offer_id=oid;
 end if;
 return oid;
end $$;
revoke all on function public.save_offer(jsonb) from public,anon,authenticated;
grant execute on function public.save_offer(jsonb) to authenticated;

create function public.set_offer_status(p_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 perform 1 from public.offers where id=p_id for update;
 if p_status='published' then
 perform 1 from public.products where id=(select product_id from public.offers where id=p_id) for update;
 update public.offers o set status='published',approved_by=auth.uid(),approved_at=now(),updated_at=now()
 from public.products p where o.id=p_id and o.product_id=p.id and o.status='draft' and o.expires_at>now()
 and p.checked_at>now()-interval '24 hours' and p.availability='available' and p.current_price_cents=o.price_cents;
 if not found then raise exception 'offer_not_eligible'; end if;
 elsif p_status='expired' then
 update public.offers set status='expired',updated_at=now() where id=p_id;
 update public.affiliate_links set active=false where offer_id=p_id;
 else raise exception 'invalid_status'; end if;
end $$;
revoke all on function public.set_offer_status(uuid,text) from public,anon,authenticated;
grant execute on function public.set_offer_status(uuid,text) to authenticated;

create function public.confirm_price(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 update public.products set checked_at=now() where id=p_id;
end $$;
revoke all on function public.confirm_price(uuid) from public,anon,authenticated;
grant execute on function public.confirm_price(uuid) to authenticated;

create function public.record_market_price(p_id uuid,p_price bigint,p_available boolean,p_key uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 perform 1 from public.products where id=p_id and provider='mercado_livre' for update;
 if not found then raise exception 'invalid_product'; end if;
 insert into public.price_history(product_id,price_cents,observation_key) values(p_id,p_price,p_key) on conflict do nothing;
 if not found then return; end if;
 update public.products set current_price_cents=p_price,availability=case when p_available then 'available' else 'unavailable' end,checked_at=now() where id=p_id;
 -- Old approved price never silently changes: catalog excludes price mismatches.
end $$;
revoke all on function public.record_market_price(uuid,bigint,boolean,uuid) from public,anon,authenticated;
grant execute on function public.record_market_price(uuid,bigint,boolean,uuid) to authenticated;

create function public.claim_publication(p_id uuid,p_channel text,p_text text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.telegram_publications;
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 if not private.eligible(p_id) then raise exception 'offer_not_eligible'; end if;
 insert into public.telegram_publications(offer_id,channel_id,message_text) values(p_id,p_channel,p_text)
 on conflict(offer_id,channel_id) do nothing returning * into r;
 if r.id is null then raise exception 'already_requested'; end if;
 return to_jsonb(r);
end $$;
revoke all on function public.claim_publication(uuid,text,text) from public,anon,authenticated;
grant execute on function public.claim_publication(uuid,text,text) to authenticated;
create function public.finish_publication(p_id uuid,p_lease uuid,p_status text,p_message text,p_error text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_status not in ('sent','failed','unknown') then raise exception 'invalid_status'; end if;
 update public.telegram_publications set status=p_status,telegram_message_id=p_message,error_code=p_error,finished_at=now()
 where id=p_id and lease_token=p_lease and status='processing';
 if not found then raise exception 'stale_publication'; end if;
end $$;
revoke all on function public.finish_publication(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_publication(uuid,uuid,text,text,text) to authenticated;

create function public.resolve_link(p_code text) returns text language sql stable security definer set search_path='' as $$
 select destination_url from public.affiliate_links where code=p_code and active and private.eligible(offer_id)
$$;
revoke all on function public.resolve_link(text) from public,anon,authenticated;
grant execute on function public.resolve_link(text) to anon,authenticated;
create function public.record_click(p_code text,p_source text,p_key text) returns void language plpgsql security definer set search_path='' as $$
declare lid uuid;
begin
 if length(p_key)<>64 or p_source not in ('site','telegram','unknown') then return; end if;
 select id into lid from public.affiliate_links where code=p_code and active and private.eligible(offer_id);
 if lid is null then return; end if;
 delete from private.click_buckets where expires_at<now();
 insert into private.click_buckets values(p_key,now()+interval '10 minutes') on conflict do nothing;
 if not found then return; end if;
 insert into public.click_daily_counts(affiliate_link_id,source,click_count) values(lid,p_source,1)
 on conflict(affiliate_link_id,day,source) do update set click_count=public.click_daily_counts.click_count+1;
end $$;
revoke all on function public.record_click(text,text,text) from public,anon,authenticated;
grant execute on function public.record_click(text,text,text) to service_role;
create function public.click_total_30_days() returns bigint language plpgsql stable security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'not_authorized' using errcode='42501'; end if;
 return (select coalesce(sum(click_count),0)::bigint from public.click_daily_counts where day >= (now() at time zone 'UTC')::date-29);
end $$;
revoke all on function public.click_total_30_days() from public,anon,authenticated;
grant execute on function public.click_total_30_days() to authenticated;
commit;
