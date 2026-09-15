import { z } from "zod";
const merchantHosts = new Set([
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
  "produto.mercadolivre.com.br",
]);
const affiliateHosts = new Set([
  ...merchantHosts,
  "mercadolivre.com",
  "www.mercadolivre.com",
  "meli.la",
]);
export function safeUrl(
  value: string,
  kind: "merchant" | "affiliate" | "image",
): boolean {
  try {
    if (/[\s\u0000-\u001f\u007f]/.test(value)) return false;
    const u = new URL(value);
    const hosts =
      kind === "image"
        ? new Set(["http2.mlstatic.com"])
        : kind === "affiliate"
          ? affiliateHosts
          : merchantHosts;
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      hosts.has(u.hostname) &&
      value.startsWith("https://")
    );
  } catch {
    return false;
  }
}
export function parsePrice(value: string): number | null {
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && cents <= 100000000 ? cents : null;
}
export const offerInput = z
  .object({
    id: z.union([z.uuid(), z.literal("")]),
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().max(2000),
    category: z.enum(["tecnologia", "casa", "cozinha", "bem-estar"]),
    provider: z.enum(["manual", "mercado_livre"]),
    external_id: z.string().trim().max(40),
    canonical_url: z
      .string()
      .max(2048)
      .refine((v) => safeUrl(v, "merchant")),
    destination_url: z
      .string()
      .max(2048)
      .refine((v) => safeUrl(v, "affiliate")),
    image_url: z
      .string()
      .max(2048)
      .refine((v) => !v || safeUrl(v, "image")),
    price_cents: z.number().int().min(1).max(100000000),
    reference_price_cents: z.number().int().min(1).max(100000000).nullable(),
    reference_basis: z.string().trim().max(300),
    expires_at: z.iso.datetime({ offset: true }),
  })
  .superRefine((v, c) => {
    if (v.provider === "mercado_livre" && !/^MLB\d+$/.test(v.external_id))
      c.addIssue({ code: "custom", message: "Identificador inválido" });
    if (
      v.reference_price_cents !== null &&
      (v.reference_price_cents <= v.price_cents || !v.reference_basis)
    )
      c.addIssue({ code: "custom", message: "Referência inválida" });
    const expiry = Date.parse(v.expires_at);
    if (expiry <= Date.now() || expiry > Date.now() + 30 * 86400000)
      c.addIssue({ code: "custom", message: "Validade inválida" });
  });
export function publicationText(
  offer: { title: string; priceCents: number; slug: string },
  appUrl: string,
) {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(offer.priceCents / 100);
  return `${offer.title}\n\nPor ${price}\n\nConfira os detalhes: ${new URL("/ofertas/" + offer.slug + "?source=telegram", appUrl)}\n\nLink de afiliado. Preço e disponibilidade podem mudar; confira na loja.`;
}
