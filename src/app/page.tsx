import Link from "next/link";
import { Header, Footer, SetupNotice } from "@/components/shell";
import { Icon } from "@/components/ui/icon";
import { Catalog } from "@/features/catalog/catalog";
import { CatalogHero } from "@/features/catalog/catalog-hero";
import { getAppState } from "@/server/env";
import { getDemoCatalog, getCatalog } from "@/server/services/catalog";

export default async function Home() {
  const state = getAppState();
  if (state === "setup")
    return (
      <>
        <Header />
        <SetupNotice />
        <Footer />
      </>
    );

  const demo = state === "demo";
  const offers = demo
    ? getDemoCatalog().filter((offer) => offer.status === "published")
    : await getCatalog();

  return (
    <>
      <Header demo={demo} />
      <main>
        <CatalogHero featured={offers[0]} demo={demo} />
        <div className="value-strip">
          <div className="container value-inner">
            <span>
              <Icon name="search" /> Encontre o que combina com você
            </span>
            <span>
              <Icon name="tag" /> Compare preços e condições
            </span>
            <span>
              <Icon name="check" /> Confira os detalhes na loja
            </span>
          </div>
        </div>
        <Catalog offers={offers} demo={demo} />
        <section className="container" aria-labelledby="how-title">
          <div className="discovery-panel">
            <span className="discovery-icon">
              <Icon name="bolt" size={32} />
            </span>
            <div>
              <span className="eyebrow">BOA COMPRA COMEÇA COM INFORMAÇÃO</span>
              <h2 id="how-title">Achou interessante? Confira de perto.</h2>
              <p>
                Veja os detalhes de cada oferta e confirme preço, frete e
                condições na loja antes de comprar.
              </p>
            </div>
            <Link className="button yellow" href="/sobre">
              Como funciona <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
