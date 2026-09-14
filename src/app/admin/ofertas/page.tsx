import { OfferTable } from "@/features/admin/offer-table";
import { getDemoCatalog } from "@/server/services/catalog";
export default function Offers() {
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
