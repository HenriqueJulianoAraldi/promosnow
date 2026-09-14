export type Category = "tecnologia" | "casa" | "cozinha" | "bem-estar";
export type ProductArt =
  | "headphones"
  | "coffee"
  | "keyboard"
  | "lamp"
  | "speaker"
  | "bottle";
export type Offer = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  priceCents: number;
  referencePriceCents: number;
  status: "draft" | "published" | "expired";
  art: ProductArt;
  color: string;
  featured: boolean;
};
export const categories: { value: Category; label: string }[] = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "casa", label: "Casa" },
  { value: "cozinha", label: "Cozinha" },
  { value: "bem-estar", label: "Bem-estar" },
];
export function formatMoney(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0)
    throw new Error("Valor monetário inválido.");
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
export function discountPercent(
  price: number,
  reference: number,
): number | null {
  if (
    ![price, reference].every(Number.isSafeInteger) ||
    price <= 0 ||
    reference <= price
  )
    return null;
  return Math.floor((1 - price / reference) * 100);
}
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}
export function selectOffers(
  offers: readonly Offer[],
  filters: { query?: string; category?: string; sort?: string },
): Offer[] {
  const query = normalizeSearch(filters.query ?? "");
  const list = offers.filter(
    (offer) =>
      offer.status === "published" &&
      (!filters.category || offer.category === filters.category) &&
      (!query ||
        normalizeSearch(`${offer.title} ${offer.description}`).includes(query)),
  );
  if (filters.sort === "price")
    return list.sort((a, b) => a.priceCents - b.priceCents);
  if (filters.sort === "discount")
    return list.sort(
      (a, b) =>
        (discountPercent(b.priceCents, b.referencePriceCents) ?? 0) -
        (discountPercent(a.priceCents, a.referencePriceCents) ?? 0),
    );
  return list.sort((a, b) => Number(b.featured) - Number(a.featured));
}
