import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { OfferImage } from "@/components/ui/offer-image";
import { formatMoney, type Offer } from "@/domain/catalog";

export function CatalogHero({
  featured,
  demo,
}: {
  featured?: Offer;
  demo: boolean;
}) {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="tiny-line" /> MENOS BUSCA. MAIS ACHADOS.
        </span>
        <h1>
          Boas ofertas.
          <br />
          <span>Do seu jeito.</span>
        </h1>
        <p>
          Explore a seleção, compare as opções e descubra o próximo achado que
          faz sentido para você.
        </p>
        <div className="hero-actions">
          <a className="button dark" href="#ofertas">
            Explorar ofertas <Icon name="arrow" />
          </a>
          <Link className="hero-secondary" href="/sobre">
            Conhecer o PromosNow <Icon name="chevron" size={16} />
          </Link>
        </div>
        <p className="hero-footnote">
          {demo
            ? "Uma prévia com produtos e preços fictícios."
            : "Podemos receber comissão por compras feitas pelos links de afiliado."}
        </p>
      </div>
      {featured ? (
        <Link
          className="featured-offer"
          href={`/ofertas/${featured.slug}`}
          aria-label={`Conhecer oferta: ${featured.title}`}
        >
          <div className="featured-heading">
            <span>{demo ? "CONHEÇA UM EXEMPLO" : "NA NOSSA SELEÇÃO"}</span>
            <Icon name="bolt" />
          </div>
          <div className={`featured-image ${featured.color}`}>
            <OfferImage offer={featured} />
          </div>
          <div className="featured-info">
            <div>
              <h2>{featured.title}</h2>
              <strong>{formatMoney(featured.priceCents)}</strong>
              <small>
                {demo ? "Preço fictício" : "Confira as condições na loja"}
              </small>
            </div>
            <span className="round-link">
              <Icon name="arrow" />
            </span>
          </div>
        </Link>
      ) : (
        <div className="discovery-art" aria-hidden="true">
          <div className="discovery-art-top">
            <span>O PRÓXIMO ACHADO</span>
            <Icon name="bolt" size={40} />
          </div>
          <strong>
            Vale a<br />
            <span>descoberta.</span>
          </strong>
          <div className="discovery-art-bottom">
            <span>Encontre. Compare. Escolha.</span>
            <Icon name="arrow" size={28} />
          </div>
        </div>
      )}
    </section>
  );
}
