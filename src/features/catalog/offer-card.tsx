import Link from "next/link";
import {
  categories,
  discountPercent,
  formatMoney,
  type Offer,
} from "@/domain/catalog";
import { ProductArt } from "@/components/ui/product-art";
import { Icon } from "@/components/ui/icon";
export function OfferCard({ offer }: { offer: Offer }) {
  const discount = discountPercent(offer.priceCents, offer.referencePriceCents);
  return (
    <article className="offer-card">
      <Link
        className={`art-wrap ${offer.color}`}
        href={`/ofertas/${offer.slug}`}
        aria-label={`Ver exemplo: ${offer.title}`}
      >
        <span className="discount">−{discount}%</span>
        <ProductArt kind={offer.art} />
        <span className="art-label">ILUSTRAÇÃO</span>
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span>
            {categories.find((c) => c.value === offer.category)?.label}
          </span>
          <span>Exemplo</span>
        </div>
        <h3>
          <Link href={`/ofertas/${offer.slug}`}>{offer.title}</Link>
        </h3>
        <div className="price-row">
          <div>
            <span className="old-price">
              {formatMoney(offer.referencePriceCents)}
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
        <p className="price-note">Preço fictício para demonstração</p>
      </div>
    </article>
  );
}
