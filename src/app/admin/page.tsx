import { getAppState } from "@/server/env";
import { adminOffers } from "@/server/repositories/live-catalog";
import { requireAdmin } from "@/server/auth/admin";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { getDemoCatalog } from "@/server/services/catalog";
export default async function Dashboard() {
  if (getAppState() === "live") {
    const offers = await adminOffers();
    const { db } = await requireAdmin();
    const { data: clicks, error } = await db.rpc("click_total_30_days");
    if (error) throw new Error("Não foi possível consultar as métricas.");
    return (
      <>
        <div className="admin-heading">
          <span className="eyebrow">SUA CURADORIA</span>
          <h1>Organize seus próximos achados.</h1>
          <p>Cadastre, revise e publique ofertas com informações conferidas.</p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>Ofertas recentes</span>
            <strong>{offers.length}</strong>
            <small>Até 200 registros</small>
          </article>
          <article className="stat-card">
            <span>Em revisão</span>
            <strong>{offers.filter((o) => o.status === "draft").length}</strong>
          </article>
          <article className="stat-card">
            <span>Acessos estimados · 30 dias</span>
            <strong>{Number(clicks ?? 0)}</strong>
            <small>Não representa pessoas únicas ou vendas</small>
          </article>
        </div>
        <section className="panel">
          <h2>Próximo passo</h2>
          <Link className="button dark" href="/admin/ofertas/nova">
            Cadastrar produto e oferta
          </Link>
          <p>
            Preços precisam ser conferidos a cada 24 horas. Supabase conectado
            pelo modo de dados reais.
          </p>
          <p>
            Mercado Livre:{" "}
            {process.env.MERCADO_LIVRE_ENABLED === "true"
              ? "configurado; valide uma consulta"
              : "não configurado"}
            . Telegram:{" "}
            {process.env.TELEGRAM_ENABLED === "true"
              ? "configurado; valide canal e bot"
              : "não configurado"}
            .
          </p>
          {!process.env.SUPABASE_SECRET_KEY ||
          !process.env.RATE_LIMIT_HASH_SECRET ? (
            <p>Métricas de cliques aguardam configuração.</p>
          ) : null}
        </section>
      </>
    );
  }
  const offers = getDemoCatalog();
  const cards: [string, number, IconName][] = [
    ["Produtos de exemplo", offers.length, "box" as const],
    [
      "Ofertas no catálogo",
      offers.filter((o) => o.status === "published").length,
      "tag" as const,
    ],
    [
      "Em revisão",
      offers.filter((o) => o.status === "draft").length,
      "clock" as const,
    ],
  ];
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">VISÃO GERAL</span>
        <h1>Vamos encontrar bons achados.</h1>
        <p>Uma prévia de como você vai organizar a sua curadoria.</p>
      </div>
      <div className="stats-grid">
        {cards.map(([label, value, icon]) => (
          <article key={label} className="stat-card">
            <div>
              <span>{label}</span>
              <Icon name={icon} />
            </div>
            <strong>{value}</strong>
            <small>Dados de demonstração</small>
          </article>
        ))}
      </div>
      <div className="admin-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Seu fluxo de curadoria</h2>
            <Icon name="arrow" />
          </div>
          {[
            {
              n: "01",
              title: "Organize os produtos",
              text: "Reúna informações e prepare sua seleção.",
              href: "/admin/produtos",
            },
            {
              n: "02",
              title: "Revise cada oferta",
              text: "Confira o preço antes de colocar no catálogo.",
              href: "/admin/ofertas",
            },
            {
              n: "03",
              title: "Prepare a divulgação",
              text: "Visualize a mensagem antes de compartilhar.",
              href: "/admin/publicacoes",
            },
          ].map((step) => (
            <Link className="workflow-row" key={step.n} href={step.href}>
              <span>{step.n}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
              <Icon name="chevron" size={17} />
            </Link>
          ))}
        </section>
        <section className="panel integration-panel">
          <span className="eyebrow">PRÓXIMAS CONEXÕES</span>
          <h2>Uma base para crescer.</h2>
          <p>As integrações serão configuradas nas próximas etapas.</p>
          {["Supabase", "Mercado Livre", "Telegram"].map((name) => (
            <div className="integration-row" key={name}>
              <strong>{name}</strong>
              <span className="badge neutral">Não conectado</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
