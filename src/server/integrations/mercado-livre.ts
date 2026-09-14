import type { ProductProvider } from "./contracts.ts";
import { safeUrl } from "../../domain/forms.ts";
export function mercadoLivreProvider(
  token: string | undefined,
  enabled: boolean,
  request: typeof fetch = fetch,
): ProductProvider {
  return {
    async getProduct(id) {
      if (!enabled || !token)
        return { ok: false, error: { code: "not_configured" } };
      if (!/^MLB\d+$/.test(id))
        return { ok: false, error: { code: "not_found" } };
      try {
        const response = await request(
          "https://api.mercadolibre.com/items/" + id,
          {
            headers: { Authorization: "Bearer " + token },
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(10000),
          },
        );
        if (!response.ok)
          return {
            ok: false,
            error: {
              code:
                response.status === 401 || response.status === 403
                  ? "unauthorized"
                  : response.status === 429
                    ? "rate_limited"
                    : response.status === 404
                      ? "not_found"
                      : "unavailable",
            },
          };
        const item = await response.json();
        const price = Math.round(Number(item.price) * 100);
        if (
          typeof item.price !== "number" ||
          item.id !== id ||
          item.currency_id !== "BRL" ||
          !Number.isSafeInteger(price) ||
          price < 1 ||
          price > 100000000 ||
          typeof item.title !== "string" ||
          !safeUrl(String(item.permalink), "merchant")
        )
          return { ok: false, error: { code: "invalid_response" } };
        return {
          ok: true,
          value: {
            externalId: id,
            title: item.title.slice(0, 180),
            canonicalUrl: item.permalink,
            imageUrl:
              typeof item.secure_thumbnail === "string" &&
              safeUrl(item.secure_thumbnail, "image")
                ? item.secure_thumbnail
                : undefined,
            priceCents: price,
            currency: "BRL",
            availability:
              item.status === "active" && Number(item.available_quantity) > 0
                ? "available"
                : "unavailable",
            observedAt: new Date().toISOString(),
          },
        };
      } catch {
        return { ok: false, error: { code: "unavailable" } };
      }
    },
  };
}
