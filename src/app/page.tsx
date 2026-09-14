import Link from "next/link";
import { Header, Footer, SetupNotice } from "@/components/shell";
import { Icon } from "@/components/ui/icon";
import { ProductArt } from "@/components/ui/product-art";
import { Catalog } from "@/features/catalog/catalog";
import { getAppState } from "@/server/env";
import { getDemoCatalog } from "@/server/services/catalog";
export default function Home() {
  const demo = getAppState() === "demo";
  if (!demo)
    return (
      <>
        <Header />
        <SetupNotice />
        <Footer />
      </>
    );
  return (
    <>
      <Header demo />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> MENOS BUSCA. MAIS ACHADOS.
            </span>
            <h1>
              Seu próximo
              <br />
              bom negócio
              <br />
              <span>começa aqui.</span>
            </h1>
            <p>
              Um lugar para descobrir ofertas, comparar escolhas e encontrar o
              que faz sentido para você.
            </p>
            <a className="button dark" href="#ofertas">
              Explorar os achados <Icon name="arrow" />
            </a>
            <div className="hero-footnote">
              <span className="small-check">
                <Icon name="check" size={14} />
              </span>{" "}
              Uma prévia do que estamos construindo
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-star">✳</div>
            <div className="hero-product">
              <span className="hero-product-tag">UM EXEMPLO DE BOM ACHADO</span>
              <ProductArt kind="headphones" />
              <div className="hero-product-bottom">
                <span>Som para o seu dia.</span>
                <span className="round-link">
                  <Icon name="arrow" />
                </span>
              </div>
            </div>
            <div className="floating-label">
              <span className="logo-mark">
                <Icon name="tag" />
              </span>
              <div>
                <strong>Vale a descoberta.</strong>
                <span>Curadoria, em construção</span>
              </div>
            </div>
            <span className="vertical-label">PROMOSNOW / PRIMEIRA EDIÇÃO</span>
          </div>
        </section>
        <div className="value-strip">
          <div className="container value-inner">
            <span>
              <Icon name="search" /> Descubra com facilidade
            </span>
            <span>
              <Icon name="tag" /> Compare antes de escolher
            </span>
            <span>
              <Icon name="clock" /> Mais tempo para você
            </span>
          </div>
        </div>
        <Catalog offers={getDemoCatalog().filter((offer) => offer.status === "published")} />
        <section className="container">
          <div className="telegram-panel">
            <div className="telegram-symbol">
              <Icon name="send" size={34} />
            </div>
            <div>
              <span className="eyebrow">OS ACHADOS VÃO ATÉ VOCÊ</span>
              <h2>
                Seu próximo achado,
                <br />
                direto no Telegram.
              </h2>
              <p>
                Estamos preparando um canal para compartilhar as ofertas. Por
                enquanto, acompanhe o projeto por aqui.
              </p>
            </div>
            <Link className="button light" href="/sobre">
              Conhecer o projeto <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
