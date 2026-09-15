import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/shell";
import { getAppState } from "@/server/env";
import { requireAdmin } from "@/server/auth/admin";
import { signOut } from "@/server/actions/auth";
import { AdminNav } from "@/features/admin/admin-nav";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = getAppState() === "demo";
  if (getAppState() === "setup") redirect("/entrar");
  if (!demo) await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Logo />
        <span className="sidebar-label">ESPAÇO DE GESTÃO</span>
        <AdminNav />
        <div className="sidebar-bottom">
          <span className="demo-pill">
            <span className="status-dot" />{" "}
            {demo ? "Demonstração" : "Administração"}
          </span>
          <p>
            {demo ? "Dados de exemplo." : "Acesso autorizado."}
            <br />
            {demo
              ? "Alterações não são salvas."
              : "Sua curadoria em um só lugar."}
          </p>
          <Link href="/">← Voltar ao site</Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Seu espaço de curadoria</span>
          <div className="admin-account">
            <Link href="/" className="text-link">
              Ver site <span aria-hidden="true">↗</span>
            </Link>
            {!demo && (
              <form action={signOut}>
                <button className="chip">Sair da conta</button>
              </form>
            )}
            <span
              className="avatar"
              aria-label={demo ? "Perfil de demonstração" : "Administração"}
            >
              PN
            </span>
          </div>
        </header>
        <div className="admin-content">
          {demo && (
            <div className="admin-notice">
              Você está explorando uma prévia. Produtos, ofertas e publicações
              são fictícios.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
