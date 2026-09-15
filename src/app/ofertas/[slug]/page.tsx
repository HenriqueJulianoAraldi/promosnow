import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/shell";
import { OfferImage } from "@/components/ui/offer-image";
import { formatMoney, discountPercent } from "@/domain/catalog";
import { getCatalog } from "@/server/services/catalog";
export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { slug } = await params;
  const source =
    (await searchParams).source === "telegram" ? "telegram" : "site";
  const offer = (await getCatalog(slug))[0];
  if (!offer) notFound();
  const demo = offer.demo !== false,
    expired = offer.status === "expired",
    discount = discountPercent(offer.priceCents, offer.referencePriceCents);
  return (
    <>
      <Header demo={demo} />
      <main className="container detail">
        <Link className="back-link" href="/#ofertas">
          ← Voltar aos achados
        </Link>
        <div className="detail-grid">
          <div className={"detail-art " + offer.color}>
            <OfferImage offer={offer} />
            <span>
              {demo
                ? "Imagem ilustrativa · Produto de demonstração"
                : offer.imageUrl
                  ? "Imagem do produto"
                  : "Imagem ilustrativa"}
            </span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow">
              {expired
                ? "EXEMPLO ENCERRADO"
                : demo
                  ? "CONHEÇA ESTE EXEMPLO"
                  : "DETALHES DA OFERTA"}
            </span>
            <h1>{offer.title}</h1>
            <p>{offer.description}</p>
            <div className="detail-price">
              {offer.referencePriceCents !== null && (
                <span className="old-price">
                  {formatMoney(offer.referencePriceCents)}
                </span>
              )}
              <strong>{formatMoney(offer.priceCents)}</strong>
              {discount !== null && (
                <span className="discount">−{discount}%</span>
              )}
            </div>
            {demo ? (
              <>
                <div className="notice">
                  <p>
                    {expired
                      ? "Este exemplo está encerrado e não aparece entre as ofertas disponíveis."
                      : "Os preços e o desconto são fictícios."}
                  </p>
                </div>
                <button className="button dark full" disabled>
                  {expired
                    ? "Exemplo encerrado"
                    : "Compra indisponível na demonstração"}
                </button>
                <p className="price-note">
                  Nenhuma loja está conectada a este exemplo.
                </p>
              </>
            ) : (
              <>
                {offer.referenceBasis && (
                  <p>Referência: {offer.referenceBasis}</p>
                )}
                <p className="price-note">
                  Conferido em{" "}
                  {new Date(offer.checkedAt!).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                  . Confira preço, frete e condições na loja.
                </p>
                <div className="notice">
                  <p>
                    Link de afiliado: podemos receber comissão pela compra, sem
                    custo adicional para você.
                  </p>
                </div>
                <a
                  className="button dark full"
                  href={"/r/" + offer.linkCode + "?source=" + source}
                  rel="sponsored nofollow"
                >
                  Ver oferta no Mercado Livre ↗
                </a>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
