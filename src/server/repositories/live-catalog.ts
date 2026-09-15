import "server-only";
import type { Category, Offer } from "@/domain/catalog";
import { publicDb } from "@/server/supabase/client";
import { requireAdmin } from "@/server/auth/admin";
export type ProductRow = {
  id: string;
  provider: "manual" | "mercado_livre";
  external_id: string | null;
  canonical_url: string;
  image_url: string | null;
  category: Category;
  checked_at: string;
  current_price_cents: number;
  availability: string;
};
export type LiveRow = {
  id: string;
  product_id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  reference_price_cents: number | null;
  reference_basis: string | null;
  status: "draft" | "published" | "expired";
  expires_at: string;
  products: ProductRow;
  affiliate_links:
    | { code: string; destination_url: string }[]
    | { code: string; destination_url: string };
};
type PublicRow = Omit<
  LiveRow,
  "products" | "affiliate_links" | "product_id"
> & {
  category: Category;
  image_url: string | null;
  provider: string;
  checked_at: string;
  code: string;
};
export function mapPublic(row: PublicRow): Offer {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    priceCents: Number(row.price_cents),
    referencePriceCents:
      row.reference_price_cents === null
        ? null
        : Number(row.reference_price_cents),
    status: row.status,
    art: "box",
    color: "sand",
    featured: false,
    demo: false,
    imageUrl: row.image_url ?? undefined,
    linkCode: row.code,
    checkedAt: row.checked_at,
    expiresAt: row.expires_at,
    referenceBasis: row.reference_basis ?? undefined,
  };
}
export async function publicOffers(slug?: string, offset = 0) {
  const { data, error } = await publicDb().rpc("catalog", {
    p_slug: slug ?? null,
    p_limit: 100,
    p_offset: offset,
  });
  if (error)
    throw new Error(
      "Não foi possível consultar o catálogo. Confira a configuração do banco.",
    );
  return (data as PublicRow[]).map(mapPublic);
}
export async function adminOffers() {
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from("offers")
    .select("*,products(*),affiliate_links(code,destination_url)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error)
    throw new Error(
      "Não foi possível carregar as ofertas. Confira se a migração foi aplicada.",
    );
  return data as unknown as LiveRow[];
}

export async function adminOffer(id: string) {
  const { db } = await requireAdmin();
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  const { data, error } = await db
    .from("offers")
    .select("*,products(*),affiliate_links(code,destination_url)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar a oferta.");
  return data as unknown as LiveRow | null;
}
