import "server-only";
import { getAppState } from "@/server/env";
import { demoOffers } from "@/server/repositories/demo-catalog";
export function getDemoCatalog() {
  return getAppState() === "demo"
    ? demoOffers.map((o) => ({ ...o, demo: true }))
    : [];
}
export function getPublicDemoOffer(slug: string) {
  return getDemoCatalog().find(
    (offer) => offer.slug === slug && offer.status !== "draft",
  );
}

export async function getCatalog(slug?: string, offset = 0) {
  if (getAppState() !== "live")
    return slug
      ? [getPublicDemoOffer(slug)].filter(
          (o): o is NonNullable<typeof o> => !!o,
        )
      : getDemoCatalog().filter((o) => o.status === "published");
  const { publicOffers } = await import("@/server/repositories/live-catalog");
  return publicOffers(slug, offset);
}
