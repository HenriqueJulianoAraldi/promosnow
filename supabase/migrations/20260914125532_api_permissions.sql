begin;
-- Keep privileged implementations out of the exposed API schema.
-- Public wrappers preserve the API and the internal administrator checks.
alter function public.catalog(text,int,int) set schema private;
alter function public.save_offer(jsonb) set schema private;
alter function public.set_offer_status(uuid,text) set schema private;
alter function public.confirm_price(uuid) set schema private;
alter function public.record_market_price(uuid,bigint,boolean,uuid) set schema private;
alter function public.claim_publication(uuid,text,text) set schema private;
alter function public.finish_publication(uuid,uuid,text,text,text) set schema private;
alter function public.resolve_link(text) set schema private;
alter function public.record_click(text,text,text) set schema private;
alter function public.click_total_30_days() set schema private;
grant usage on schema private to anon,service_role;

create function public.catalog(p_slug text default null,p_limit int default 100,p_offset int default 0) returns jsonb language sql stable security invoker set search_path='' as $$ select private.catalog(p_slug,p_limit,p_offset) $$;
create function public.save_offer(payload jsonb) returns uuid language sql security invoker set search_path='' as $$ select private.save_offer(payload) $$;
create function public.set_offer_status(p_id uuid,p_status text) returns void language sql security invoker set search_path='' as $$ select private.set_offer_status(p_id,p_status) $$;
create function public.confirm_price(p_id uuid) returns void language sql security invoker set search_path='' as $$ select private.confirm_price(p_id) $$;
create function public.record_market_price(p_id uuid,p_price bigint,p_available boolean,p_key uuid) returns void language sql security invoker set search_path='' as $$ select private.record_market_price(p_id,p_price,p_available,p_key) $$;
create function public.claim_publication(p_id uuid,p_channel text,p_text text) returns jsonb language sql security invoker set search_path='' as $$ select private.claim_publication(p_id,p_channel,p_text) $$;
create function public.finish_publication(p_id uuid,p_lease uuid,p_status text,p_message text,p_error text) returns void language sql security invoker set search_path='' as $$ select private.finish_publication(p_id,p_lease,p_status,p_message,p_error) $$;
create function public.resolve_link(p_code text) returns text language sql stable security invoker set search_path='' as $$ select private.resolve_link(p_code) $$;
create function public.record_click(p_code text,p_source text,p_key text) returns void language sql security invoker set search_path='' as $$ select private.record_click(p_code,p_source,p_key) $$;
create function public.click_total_30_days() returns bigint language sql stable security invoker set search_path='' as $$ select private.click_total_30_days() $$;

revoke all on function public.catalog(text,int,int),public.save_offer(jsonb),public.set_offer_status(uuid,text),public.confirm_price(uuid),public.record_market_price(uuid,bigint,boolean,uuid),public.claim_publication(uuid,text,text),public.finish_publication(uuid,uuid,text,text,text),public.resolve_link(text),public.record_click(text,text,text),public.click_total_30_days() from public,anon,authenticated;
grant execute on function public.catalog(text,int,int),public.resolve_link(text) to anon,authenticated;
grant execute on function public.save_offer(jsonb),public.set_offer_status(uuid,text),public.confirm_price(uuid),public.record_market_price(uuid,bigint,boolean,uuid),public.claim_publication(uuid,text,text),public.finish_publication(uuid,uuid,text,text,text),public.click_total_30_days() to authenticated;
grant execute on function public.record_click(text,text,text) to service_role;

-- Defense in depth for the temporary, non-public deduplication data.
alter table private.click_buckets enable row level security;
revoke all on private.click_buckets from public,anon,authenticated;
create index products_category on public.products(category);
create index offers_approved_by on public.offers(approved_by);
alter policy admin_self on public.admin_users using(user_id=(select auth.uid()));
-- Supabase may install this event-trigger function when provisioning a project.
-- Event triggers need no direct execution permission through the Data API.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  execute 'revoke execute on function public.rls_auto_enable() from public,anon,authenticated';
 end if;
end $$;
commit;
