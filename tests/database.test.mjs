import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("migration, API permissions, approval, freshness and delivery deduplication", async () => {
  const db = new PGlite();
  const admin = "11111111-1111-4111-8111-111111111111";
  const outsider = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to anon,authenticated,service_role;
 grant execute on function auth.uid() to anon,authenticated,service_role;`);
    const migrationRoot = new URL("../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(migrationRoot))
      .filter((n) => n.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(file, migrationRoot), "utf8"));
    assert.equal(
      (
        await db.query(
          "select count(*)::int as n from pg_proc join pg_namespace on pg_namespace.oid=pronamespace where nspname='public' and prosecdef",
        )
      ).rows[0].n,
      0,
    );
    await db.query("insert into auth.users values($1),($2)", [admin, outsider]);
    await db.query("insert into public.admin_users(user_id) values($1)", [
      admin,
    ]);
    const role = async (name, uid = "") => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        uid,
      ]);
      await db.exec("set role " + name);
    };
    const rpc = async (sql, params = []) =>
      (await db.query(sql, params)).rows[0];
    const catalog = async () =>
      (await rpc("select public.catalog() as data")).data;
    const input = {
      id: "",
      title: "Cafeteira verificada",
      description: "Produto de teste",
      provider: "manual",
      external_id: "",
      canonical_url: "https://www.mercadolivre.com.br/cafeteira",
      destination_url: "https://meli.la/teste",
      image_url: "",
      category: "cozinha",
      price_cents: 9990,
      reference_price_cents: null,
      reference_basis: "",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    const save = async (payload) =>
      (
        await rpc("select public.save_offer($1::jsonb) as id", [
          JSON.stringify(payload),
        ])
      ).id;
    await role("anon");
    assert.deepEqual(await catalog(), []);
    await assert.rejects(
      db.query("select * from public.offers"),
      /permission denied/,
    );
    await assert.rejects(save(input), /permission denied/);
    await role("authenticated", outsider);
    assert.deepEqual((await db.query("select * from public.offers")).rows, []);
    await assert.rejects(save(input), /not_authorized/);
    await assert.rejects(
      db.query("insert into public.admin_users(user_id) values($1)", [
        outsider,
      ]),
      /permission denied/,
    );
    await role("authenticated", admin);
    await assert.rejects(
      db.query("update public.products set title='bypass'"),
      /permission denied/,
    );
    for (const destination_url of [
      "https://evil.com/a",
      "https://meli.la.evil.com/a",
      "https://meli.la@evil.com/a",
      "javascript:alert(1)",
      null,
    ])
      await assert.rejects(save({ ...input, destination_url }), /invalid_url/);
    await assert.rejects(
      save({ ...input, price_cents: -1 }),
      /check constraint/,
    );
    await assert.rejects(
      save({ ...input, reference_price_cents: 11000, reference_basis: "" }),
      /check constraint/,
    );
    await assert.rejects(
      save({ ...input, provider: "mercado_livre", external_id: "" }),
      /check constraint/,
    );
    await assert.rejects(
      save({
        ...input,
        expires_at: new Date(Date.now() - 60000).toISOString(),
      }),
      /invalid_expiry/,
    );
    const id = await save(input);
    assert.deepEqual(await catalog(), []);
    await db.query("select public.set_offer_status($1,'published')", [id]);
    const published = await catalog();
    assert.equal(published.length, 1);
    assert.equal(published[0].title, input.title);
    assert.equal("destination_url" in published[0], false);
    assert.equal("approved_by" in published[0], false);
    const product = (
      await rpc("select product_id from public.offers where id=$1", [id])
    ).product_id;
    await assert.rejects(save({ ...input, id }), /edit_draft_only/);
    await assert.rejects(save({ ...input, id: "" }), /archive_published_first/);
    await role("anon");
    assert.equal((await catalog()).length, 1);
    assert.equal(
      (await rpc("select public.resolve_link($1) as url", [published[0].code]))
        .url,
      input.destination_url,
    );
    await assert.rejects(
      db.query("select public.record_click($1,'site',$2)", [
        published[0].code,
        "a".repeat(64),
      ]),
      /permission denied/,
    );
    await role("authenticated", admin);
    await assert.rejects(
      db.query("select public.record_click($1,'site',$2)", [
        published[0].code,
        "a".repeat(64),
      ]),
      /permission denied/,
    );
    const job = (
      await rpc(
        "select public.claim_publication($1,'@test_channel','Mensagem revisada') as data",
        [id],
      )
    ).data;
    await assert.rejects(
      db.query(
        "select public.claim_publication($1,'@test_channel','Repetida')",
        [id],
      ),
      /already_requested/,
    );
    await assert.rejects(
      db.query("select public.finish_publication($1,$2,'sent','123',null)", [
        job.id,
        admin,
      ]),
      /stale_publication/,
    );
    await db.query(
      "select public.finish_publication($1,$2,'sent','123',null)",
      [job.id, job.lease_token],
    );
    await assert.rejects(
      db.query("select public.finish_publication($1,$2,'sent','124',null)", [
        job.id,
        job.lease_token,
      ]),
      /stale_publication/,
    );
    await role("service_role");
    await db.query("select public.record_click($1,'telegram',$2)", [
      published[0].code,
      "a".repeat(64),
    ]);
    await db.query("select public.record_click($1,'telegram',$2)", [
      published[0].code,
      "a".repeat(64),
    ]);
    await role("authenticated", admin);
    assert.equal(
      Number(
        (await rpc("select click_count from public.click_daily_counts"))
          .click_count,
      ),
      1,
    );
    for (const change of [
      "checked_at=now()-interval '25 hours'",
      "current_price_cents=1",
      "availability='unavailable'",
    ]) {
      await db.exec("reset role");
      await db.query("update public.products set " + change + " where id=$1", [
        product,
      ]);
      await role("anon");
      assert.deepEqual(await catalog(), []);
      assert.equal(
        (
          await rpc("select public.resolve_link($1) as url", [
            published[0].code,
          ])
        ).url,
        null,
      );
      await db.exec("reset role");
      await db.query(
        "update public.products set checked_at=now(),current_price_cents=$2,availability='available' where id=$1",
        [product, input.price_cents],
      );
    }
    await role("authenticated", admin);
    await db.query("select public.set_offer_status($1,'expired')", [id]);
    assert.deepEqual(await catalog(), []);
    const ml = await save({
      ...input,
      provider: "mercado_livre",
      external_id: "MLB123456",
    });
    const mlproduct = (
      await rpc("select product_id from public.offers where id=$1", [ml])
    ).product_id;
    await db.query("select public.set_offer_status($1,'published')", [ml]);
    const key = "33333333-3333-4333-8333-333333333333";
    await db.query("select public.record_market_price($1,12000,true,$2)", [
      mlproduct,
      key,
    ]);
    await db.query("select public.record_market_price($1,15000,true,$2)", [
      mlproduct,
      key,
    ]);
    assert.deepEqual(await catalog(), []);
    assert.equal(
      Number(
        (
          await rpc(
            "select current_price_cents from public.products where id=$1",
            [mlproduct],
          )
        ).current_price_cents,
      ),
      12000,
    );
    assert.equal(
      Number(
        (
          await rpc(
            "select count(*) as n from public.price_history where product_id=$1",
            [mlproduct],
          )
        ).n,
      ),
      2,
    );
  } finally {
    await db.close();
  }
});
