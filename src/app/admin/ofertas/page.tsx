import { getAppState } from "@/server/env";
import { adminOffers } from "@/server/repositories/live-catalog";
import { LiveOffers } from "@/features/admin/live-offers";
import { ResultNotice } from "@/features/admin/result";
import { OfferTable } from "@/features/admin/offer-table";
import { getDemoCatalog } from "@/server/services/catalog";
export default async function Offers({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  if (getAppState() === "live") {
    const { result } = await searchParams;
    return (
      <>
        <ResultNotice code={result} />
        <LiveOffers offers={await adminOffers()} />
      </>
    );
  }
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">SUA CURADORIA</span>
        <h1>Ofertas</h1>
        <p>
          Confira exemplos de ofertas no catálogo, em revisão e encerradas. A
          aprovação será habilitada em uma próxima etapa.
        </p>
      </div>
      <OfferTable offers={getDemoCatalog()} kind="ofertas" />
    </>
  );
}
