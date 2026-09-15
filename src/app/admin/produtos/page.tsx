import { getAppState } from "@/server/env";
import { adminOffers } from "@/server/repositories/live-catalog";
import { LiveOffers } from "@/features/admin/live-offers";
import { ResultNotice } from "@/features/admin/result";
import { OfferTable } from "@/features/admin/offer-table";
import { getDemoCatalog } from "@/server/services/catalog";
export default async function Products({
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
