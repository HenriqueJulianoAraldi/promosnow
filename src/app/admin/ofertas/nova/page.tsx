import { requireAdmin } from "@/server/auth/admin";
import { OfferForm } from "@/features/admin/offer-form";
export default async function NewOffer() {
  await requireAdmin();
  return <OfferForm />;
}
