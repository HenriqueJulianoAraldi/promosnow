import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/shell";
import { ProductArt } from "@/components/ui/product-art";
import { Icon } from "@/components/ui/icon";
import { formatMoney, discountPercent } from "@/domain/catalog";
import { getPublicDemoOffer } from "@/server/services/catalog";
export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = getPublicDemoOffer(slug);
  if (!offer) notFound();
  const expired = offer.status === "expired";
  return (
    <>
      <Header demo />
      <main className="container detail">
        <Link className="back-link" href="/#ofertas">
          ← Voltar aos achados
        </Link>
        <div className="detail-grid">
          <div className={`detail-art ${offer.color}`}>
            <ProductArt kind={offer.art} />
            <span>Imagem ilustrativa · Produto de demonstração</span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow">
              {expired ? "EXEMPLO ENCERRADO" : "CONHEÇA ESTE EXEMPLO"}
            </span>
            <h1>{offer.title}</h1>
            <p>{offer.description}</p>
            <div className="detail-price">
              <span className="old-price">
                {formatMoney(offer.referencePriceCents)}
              </span>
              <strong>{formatMoney(offer.priceCents)}</strong>
              <span className="discount">
                −{discountPercent(offer.priceCents, offer.referencePriceCents)}%
              </span>
            </div>
            <div className="notice">
              <Icon name="tag" />
              <p>
                {expired
                  ? "Este exemplo está encerrado e não aparece entre as ofertas disponíveis."
                  : "Os preços e o desconto são fictícios. Este produto demonstra como uma oferta será apresentada."}
              </p>
            </div>
            <button className="button dark full" disabled>
              {expired
                ? "Exemplo encerrado"
                : "Compra indisponível na demonstração"}
            </button>
            <p className="price-note">
              Nenhuma loja ou link de afiliado está conectado a este exemplo.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
