import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { getAppState } from "@/server/env";
export default function SignIn() {
  const demo = getAppState() === "demo";
  return (
    <>
      <Header />
      <main className="container auth-page">
        <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
        <h1>{demo ? "Conheça o painel." : "Acesso ainda indisponível."}</h1>
        <p>
          {demo
            ? "Nesta primeira versão, você pode explorar um painel com dados fictícios. Não é necessário informar senha."
            : "O acesso administrativo será liberado quando a autenticação estiver configurada."}
        </p>
        {demo && (
          <Link className="button dark" href="/admin">
            Explorar demonstração
          </Link>
        )}
        <Link className="back-link" href="/">
          Voltar ao site
        </Link>
      </main>
      <Footer />
    </>
  );
}
