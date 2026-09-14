import test from "node:test";
import assert from "node:assert/strict";
import {
  discountPercent,
  formatMoney,
  selectOffers,
  type Offer,
} from "../src/domain/catalog.ts";
import { parseConfig, ConfigurationError } from "../src/domain/config.ts";
import {
  disabledProductProvider,
  disabledAffiliateProvider,
  disabledPublicationChannel,
} from "../src/server/integrations/disabled.ts";

const base: Offer = {
  id: "a",
  slug: "a",
  title: "Café de exemplo",
  description: "Para a manhã",
  category: "cozinha",
  priceCents: 1000,
  referencePriceCents: 2000,
  status: "published",
  art: "coffee",
  color: "peach",
  featured: false,
};

test("discount is conservative and rejects invalid or missing price comparisons", () => {
  assert.equal(discountPercent(24990, 39990), 37);
  for (const [price, reference] of [
    [0, 100],
    [-1, 100],
    [100, 100],
    [101, 100],
    [1.5, 100],
    [NaN, 100],
    [100, Infinity],
  ])
    assert.equal(discountPercent(price, reference), null);
  assert.match(formatMoney(24990), /249,90/);
  assert.throws(() => formatMoney(Number.MAX_SAFE_INTEGER + 1));
});
test("public filtering hides drafts and expired offers even when searching their titles", () => {
  const records: Offer[] = [
    base,
    { ...base, id: "draft", status: "draft" },
    { ...base, id: "expired", status: "expired" },
  ];
  assert.deepEqual(
    selectOffers(records, { query: "cafe" }).map((o) => o.id),
    ["a"],
  );
  assert.equal(selectOffers(records, { category: "tecnologia" }).length, 0);
  assert.equal(selectOffers(records, { query: "ausente" }).length, 0);
});
test("sorting never mutates repository data and handles accents and whitespace", () => {
  const records = [{ ...base, id: "expensive", priceCents: 1500 }, base];
  assert.deepEqual(
    selectOffers(records, { query: " CAFÉ ", sort: "price" }).map((o) => o.id),
    ["a", "expensive"],
  );
  assert.deepEqual(
    records.map((o) => o.id),
    ["expensive", "a"],
  );
  assert.deepEqual(
    selectOffers(records, { sort: "discount" }).map((o) => o.id),
    ["a", "expensive"],
  );
});
test("production never exposes demo data, including a conflicting Vercel environment", () => {
  assert.equal(parseConfig({ NODE_ENV: "production" }).demoAllowed, false);
  assert.equal(
    parseConfig({
      VERCEL_ENV: "production",
      APP_ENV: "preview",
      DATA_MODE: "demo",
    }).demoAllowed,
    false,
  );
  assert.equal(parseConfig({ APP_ENV: "production" }).demoAllowed, false);
  assert.equal(
    parseConfig({ VERCEL_ENV: "preview", NODE_ENV: "production" }).demoAllowed,
    true,
  );
  assert.equal(parseConfig({}).demoAllowed, true);
});
test("flags use exact boolean strings and numbers have bounded positive values", () => {
  assert.doesNotThrow(() =>
    parseConfig({ TELEGRAM_ENABLED: "false", MERCADO_LIVRE_ENABLED: "false" }),
  );
  for (const env of [
    { TELEGRAM_ENABLED: "yes" },
    { JOB_BATCH_SIZE: "0" },
    { JOB_BATCH_SIZE: "101" },
    { PRICE_MAX_AGE_HOURS: "1.5" },
    { APP_TIMEZONE: "invalid" },
    { APP_ENV: "other" },
    { DATA_MODE: "other" },
    { APP_URL: "javascript:alert(1)" },
  ])
    assert.throws(() => parseConfig(env), ConfigurationError);
});
test("configured integrations require their secrets but never include values in errors", () => {
  assert.throws(
    () =>
      parseConfig({
        TELEGRAM_ENABLED: "true",
        TELEGRAM_BOT_TOKEN: "sensitive-example",
      }),
    /TELEGRAM_CHANNEL_ID/,
  );
  assert.throws(
    () => parseConfig({ DATA_MODE: "supabase" }),
    /NEXT_PUBLIC_SUPABASE_URL/,
  );
  assert.throws(
    () =>
      parseConfig({
        MERCADO_LIVRE_ENABLED: "true",
        MERCADO_LIVRE_CLIENT_ID: "id",
        MERCADO_LIVRE_CLIENT_SECRET: "secret",
        MERCADO_LIVRE_REDIRECT_URI: "http:\/\/localhost",
      }),
    /MERCADO_LIVRE_REDIRECT_URI/,
  );
});
test("disabled adapters return explicit failure without any network calls", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Unexpected network access");
  };
  try {
    assert.deepEqual(await disabledProductProvider.getProduct("demo"), {
      ok: false,
      error: { code: "not_configured" },
    });
    assert.deepEqual(await disabledAffiliateProvider.resolve("demo"), {
      ok: false,
      error: { code: "not_configured" },
    });
    assert.deepEqual(
      await disabledPublicationChannel.publish({
        channelId: "channel",
        text: "preview",
      }),
      { status: "failed", error: { code: "not_configured" }, retryable: false },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
