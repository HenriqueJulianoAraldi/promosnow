import Link from "next/link";
import { Icon } from "@/components/ui/icon";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="PromosNow — início">
      <span className="logo-mark">
        <Icon name="bolt" size={22} />
      </span>
      promos<span>now</span>
      <span className="logo-dot">.</span>
    </Link>
  );
}
export function Header({ demo = false }: { demo?: boolean }) {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav aria-label="Navegação principal">
            <Link href="/#ofertas">Explorar ofertas</Link>
            <Link href="/sobre">Como funciona</Link>
            <Link href="/admin" className="admin-link">
              Painel <Icon name="arrow" size={16} />
            </Link>
          </nav>
        </div>
      </header>
      {demo && (
        <div className="demo-banner">
          <span className="status-dot" /> Ambiente de demonstração · Produtos e
          preços fictícios. Nenhuma compra ou publicação é realizada.
        </div>
      )}
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Logo />
          <p>Boas escolhas começam com uma boa pesquisa.</p>
        </div>
        <div>
          <Link href="/sobre">Sobre o projeto</Link>
          <span>PromosNow · Em desenvolvimento</span>
        </div>
      </div>
    </footer>
  );
}
export function SetupNotice() {
  return (
    <main className="container setup">
      <span className="eyebrow">ESTAMOS PREPARANDO TUDO</span>
      <h1>
        Boas ofertas.
        <br />
        <span>Em breve, por aqui.</span>
      </h1>
      <p>
        O PromosNow está ganhando forma. Ainda não há ofertas disponíveis. Volte
        em breve para acompanhar.
      </p>
      <Link className="button dark" href="/sobre">
        Conhecer o projeto <Icon name="arrow" />
      </Link>
    </main>
  );
}
