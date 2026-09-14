import test from "node:test";
import assert from "node:assert/strict";
import {
  safeUrl,
  parsePrice,
  publicationText,
  offerInput,
} from "../src/domain/forms.ts";
import { mercadoLivreProvider } from "../src/server/integrations/mercado-livre.ts";
import { telegramChannel } from "../src/server/integrations/telegram.ts";

const forbiddenFetch: typeof fetch = async () => {
  throw new Error("Unexpected network call");
};
test("prices and affiliate URLs reject ambiguous values and foreign hosts", () => {
  assert.equal(parsePrice("249,90"), 24990);
  assert.equal(parsePrice("0.01"), 1);
  for (const s of ["-1", "0", "1.234,00", "NaN", "10e2", "1,999", "9999999"])
    assert.equal(parsePrice(s), null);
  assert.ok(safeUrl("https://meli.la/test", "affiliate"));
  for (const u of [
    "http://meli.la/a",
    "https://meli.la.evil.test/a",
    "https://meli.la@evil.test/a",
    "https://meli.la:123/a",
    "https://evil.test/a",
    "https://meli.la/a\nb",
  ])
    assert.equal(safeUrl(u, "affiliate"), false);
  assert.equal(safeUrl("https://evil.test/image.png", "image"), false);
  const valid = {
    id: "",
    title: "Cafeteira",
    description: "",
    category: "cozinha",
    provider: "manual",
    external_id: "",
    canonical_url: "https://www.mercadolivre.com.br/produto",
    destination_url: "https://meli.la/a",
    image_url: "",
    price_cents: 1000,
    reference_price_cents: null,
    reference_basis: "",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
  assert.ok(offerInput.safeParse(valid).success);
  assert.equal(
    offerInput.safeParse({ ...valid, reference_price_cents: 2000 }).success,
    false,
  );
  assert.equal(
    offerInput.safeParse({
      ...valid,
      provider: "mercado_livre",
      external_id: "../secret",
    }).success,
    false,
  );
  const message = publicationText(
    { title: "Café <&>", priceCents: 1000, slug: "oferta-1" },
    "https://promos.example",
  );
  assert.match(message, /ofertas\/oferta-1\?source=telegram/);
  assert.match(message, /Link de afiliado/);
});
test("Mercado Livre validates identity, currency and provider responses", async () => {
  assert.deepEqual(
    await mercadoLivreProvider("token", false, forbiddenFetch).getProduct(
      "MLB123",
    ),
    { ok: false, error: { code: "not_configured" } },
  );
  assert.deepEqual(
    await mercadoLivreProvider("token", true, forbiddenFetch).getProduct(
      "../secret",
    ),
    { ok: false, error: { code: "not_found" } },
  );
  const item = {
    id: "MLB123",
    title: "Café",
    price: 10.99,
    currency_id: "BRL",
    permalink: "https://www.mercadolivre.com.br/cafe",
    status: "active",
    available_quantity: 1,
    secure_thumbnail: "https://http2.mlstatic.com/cafe.jpg",
  };
  const request: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.mercadolibre.com/items/MLB123");
    assert.equal(
      (options?.headers as Record<string, string>).Authorization,
      "Bearer test",
    );
    assert.equal(options?.redirect, "error");
    return Response.json(item);
  };
  const result = await mercadoLivreProvider("test", true, request).getProduct(
    "MLB123",
  );
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.priceCents, 1099);
    assert.equal(result.value.availability, "available");
  }
  for (const changed of [
    { currency_id: "USD" },
    { id: "MLB999" },
    { price: null },
    { permalink: "https://evil.test/" },
    { price: -1 },
  ]) {
    const r = await mercadoLivreProvider("test", true, async () =>
      Response.json({ ...item, ...changed }),
    ).getProduct("MLB123");
    assert.deepEqual(r, { ok: false, error: { code: "invalid_response" } });
  }
  const limited = await mercadoLivreProvider(
    "test",
    true,
    async () => new Response("", { status: 429 }),
  ).getProduct("MLB123");
  assert.deepEqual(limited, { ok: false, error: { code: "rate_limited" } });
});
test("Telegram confirms only a message ID and never retries ambiguous delivery", async () => {
  const input = { channelId: "@test_channel", text: "Oferta <b>literal</b>" };
  let calls = 0;
  const request: typeof fetch = async (_url, options) => {
    calls++;
    const body = JSON.parse(String(options?.body));
    assert.equal(body.text, input.text);
    assert.equal(body.parse_mode, undefined);
    return Response.json({ ok: true, result: { message_id: 321 } });
  };
  assert.deepEqual(
    await telegramChannel("test", true, request).publish(input),
    { status: "sent", messageId: "321" },
  );
  assert.equal(calls, 1);
  assert.equal(
    (await telegramChannel("test", false, forbiddenFetch).publish(input))
      .status,
    "failed",
  );
  calls = 0;
  const timeout: typeof fetch = async () => {
    calls++;
    throw new Error("Response lost");
  };
  assert.equal(
    (await telegramChannel("test", true, timeout).publish(input)).status,
    "unknown",
  );
  assert.equal(calls, 1);
  assert.equal(
    (
      await telegramChannel("test", true, async () =>
        Response.json({ ok: true, result: {} }),
      ).publish(input)
    ).status,
    "unknown",
  );
  const limited = await telegramChannel("test", true, async () =>
    Response.json(
      { ok: false, error_code: 429, parameters: { retry_after: 30 } },
      { status: 429 },
    ),
  ).publish(input);
  assert.equal(limited.status, "failed");
  if (limited.status === "failed")
    assert.equal(limited.error.code, "rate_limited");
});
