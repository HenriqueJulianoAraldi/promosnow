import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { getAppState } from "@/server/env";
import { signIn, signOut } from "@/server/actions/auth";
import { Submit } from "@/components/ui/submit";
import { ResultNotice } from "@/features/admin/result";
import { Icon } from "@/components/ui/icon";
export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const state = getAppState();
  const { result } = await searchParams;
  return (
    <>
      <Header />
      <main className="container auth-page">
        <div className="auth-card">
          <span className="auth-symbol">
            <Icon name="bolt" size={28} />
          </span>
          <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
          <h1>
            {state === "demo"
              ? "Conheça o painel."
              : state === "live"
                ? "Entre na sua conta."
                : "Acesso ainda indisponível."}
          </h1>
          <ResultNotice code={result} />
          {state === "live" ? (
            <form className="live-form" action={signIn}>
              <label className="field">
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  maxLength={254}
                />
              </label>
              <label className="field">
                Senha
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  maxLength={200}
                />
              </label>
              <Submit>Entrar no painel</Submit>
              <p>
                O acesso é exclusivo para contas autorizadas pelo responsável
                pelo projeto.
              </p>
            </form>
          ) : (
            <p>
              {state === "demo"
                ? "Explore um painel com dados fictícios. Não é necessário informar senha."
                : "O acesso administrativo será liberado quando a autenticação estiver configurada."}
            </p>
          )}
          {state === "demo" && (
            <Link className="button dark" href="/admin">
              Explorar demonstração
            </Link>
          )}
          {state === "live" && result === "forbidden" && (
            <form action={signOut}>
              <Submit>Sair e usar outra conta</Submit>
            </form>
          )}
          <Link className="back-link" href="/">
            Voltar ao site
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
