import { OfferTable } from "@/features/admin/offer-table";
import { getDemoCatalog } from "@/server/services/catalog";
export default function Products() {
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">SUA SELEÇÃO</span>
        <h1>Produtos</h1>
        <p>
          Explore os registros que vão dar origem às ofertas. O cadastro será
          habilitado ao conectar o banco de dados.
        </p>
      </div>
      <OfferTable offers={getDemoCatalog()} kind="produtos" />
    </>
  );
}
