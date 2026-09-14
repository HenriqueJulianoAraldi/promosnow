import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/shell";
import { getAppState } from "@/server/env";
import { AdminNav } from "@/features/admin/admin-nav";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // There are no protected records yet. Demo access must never survive production.
  if (getAppState() !== "demo") redirect("/entrar");
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Logo />
        <span className="sidebar-label">ESPAÇO DE GESTÃO</span>
        <AdminNav />
        <div className="sidebar-bottom">
          <span className="demo-pill">
            <span className="status-dot" /> Demonstração
          </span>
          <p>
            Dados de exemplo.
            <br />
            Alterações não são salvas.
          </p>
          <Link href="/">← Voltar ao site</Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Seu espaço de curadoria</span>
          <span className="avatar" aria-label="Perfil de demonstração">
            PN
          </span>
        </header>
        <div className="admin-content">
          <div className="admin-notice">
            Você está explorando uma prévia. Produtos, ofertas e publicações são
            fictícios.
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
