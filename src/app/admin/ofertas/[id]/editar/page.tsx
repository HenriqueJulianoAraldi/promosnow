import { notFound } from "next/navigation";
import { adminOffer } from "@/server/repositories/live-catalog";
import { OfferForm } from "@/features/admin/offer-form";
export default async function EditOffer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await adminOffer(id);
  if (!offer || offer.status !== "draft") notFound();
  return <OfferForm offer={offer} />;
}
