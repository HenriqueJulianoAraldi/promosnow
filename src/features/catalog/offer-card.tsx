import Link from "next/link";
import {
  categories,
  discountPercent,
  formatMoney,
  type Offer,
} from "@/domain/catalog";
import { OfferImage } from "@/components/ui/offer-image";
import { Icon } from "@/components/ui/icon";
export function OfferCard({ offer }: { offer: Offer }) {
  const discount = discountPercent(offer.priceCents, offer.referencePriceCents);
  return (
    <article className="offer-card">
      <Link
        className={`art-wrap ${offer.color}`}
        href={`/ofertas/${offer.slug}`}
        aria-label={`Ver oferta: ${offer.title}`}
      >
        {discount !== null && <span className="discount">−{discount}%</span>}
        <OfferImage offer={offer} />
        <span className="art-label">
          {offer.imageUrl ? "PRODUTO" : "ILUSTRAÇÃO"}
        </span>
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span>
            {categories.find((c) => c.value === offer.category)?.label}
          </span>
          <span>{offer.demo === false ? "Afiliado" : "Exemplo"}</span>
        </div>
        <h3>
          <Link href={`/ofertas/${offer.slug}`}>{offer.title}</Link>
        </h3>
        <div className="price-row">
          <div>
            <span className="old-price">
              {offer.referencePriceCents !== null
                ? formatMoney(offer.referencePriceCents)
                : ""}
            </span>
            <strong>{formatMoney(offer.priceCents)}</strong>
          </div>
          <Link
            className="round-link"
            href={`/ofertas/${offer.slug}`}
            aria-label={`Detalhes de ${offer.title}`}
          >
            <Icon name="arrow" />
          </Link>
        </div>
        <Link className="card-cta" href={`/ofertas/${offer.slug}`}>
          Ver detalhes <Icon name="arrow" size={17} />
        </Link>
        <p className="price-note">
          {offer.demo === false
            ? "Confira preço e condições na loja"
            : "Preço fictício para demonstração"}
        </p>
      </div>
    </article>
  );
}
