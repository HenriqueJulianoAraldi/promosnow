import { getAppState } from "@/server/env";
import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { Icon } from "@/components/ui/icon";
export default function About() {
  if (getAppState() === "live")
    return (
      <>
        <Header />
        <main className="container about">
          <span className="eyebrow">SOBRE O PROMOSNOW</span>
          <h1>Escolhas com mais informação.</h1>
          <p>
            Reunimos ofertas revisadas pelo responsável pelo catálogo. Não
            vendemos produtos: a compra acontece no Mercado Livre, onde você
            deve conferir preço, frete e condições.
          </p>
          <h2>Links de afiliado</h2>
          <p>
            Podemos receber comissão quando você compra pelos nossos links, sem
            custo adicional para você.
          </p>
          <h2>Preços e disponibilidade</h2>
          <p>
            O catálogo mostra quando o preço foi conferido. Uma oferta deixa de
            aparecer quando vence, fica indisponível ou sua última verificação
            ultrapassa 24 horas.
          </p>
          <h2>Métricas</h2>
          <p>
            Quando ativadas, contamos acessos aos links de forma agregada. Esses
            números não representam pessoas únicas ou compras. Endereços IP não
            são armazenados em texto; uma chave temporária é utilizada para
            reduzir contagens repetidas.
          </p>
          <Link className="button dark" href="/">
            Ver ofertas
          </Link>
        </main>
        <Footer />
      </>
    );
  return (
    <>
      <Header />
      <main className="container about">
        <span className="eyebrow">PRAZER, SOMOS O PROMOSNOW</span>
        <h1>
          Menos tempo procurando.
          <br />
          <span>Mais escolhas que fazem sentido.</span>
        </h1>
        <p className="lead">
          Estamos construindo um lugar para reunir promoções e ajudar você a
          decidir com mais clareza.
        </p>
        <div className="about-grid">
          {[
            {
              icon: "search" as const,
              title: "Descobrir",
              text: "Um catálogo organizado por categoria, com busca e preços fáceis de comparar.",
            },
            {
              icon: "tag" as const,
              title: "Entender",
              text: "Informações sobre a oferta e seu preço de referência, com clareza sobre o que está sendo comparado.",
            },
            {
              icon: "send" as const,
              title: "Acompanhar",
              text: "No futuro, as ofertas também poderão chegar a um canal do Telegram.",
            },
          ].map((item) => (
            <article key={item.title}>
              <Icon name={item.icon} size={26} />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className="notice">
          <Icon name="clock" />
          <div>
            <h2>Estamos na primeira etapa.</h2>
            <p>
              O catálogo de demonstração contém produtos, imagens e preços
              fictícios. Ainda não vendemos produtos, enviamos alertas ou
              registramos cliques de ofertas.
            </p>
            <p>
              Quando houver links de afiliado, eles serão identificados. A
              compra acontecerá na loja de destino, e os valores e condições
              deverão ser conferidos por lá.
            </p>
          </div>
        </div>
        <Link className="button dark" href="/">
          Voltar ao início <Icon name="arrow" />
        </Link>
      </main>
      <Footer />
    </>
  );
}
