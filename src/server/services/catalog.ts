import "server-only";
import { getAppState } from "@/server/env";
import { demoOffers } from "@/server/repositories/demo-catalog";
export function getDemoCatalog() {
  return getAppState() === "demo" ? [...demoOffers] : [];
}
export function getPublicDemoOffer(slug: string) {
  return getDemoCatalog().find(
    (offer) => offer.slug === slug && offer.status !== "draft",
  );
}
