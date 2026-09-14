import Link from "next/link";
import { formatMoney } from "@/domain/catalog";
import { changeStatus, confirmPrice } from "@/server/actions/offers";
import { refreshMarketPrice } from "@/server/actions/integrations";
import { Submit } from "@/components/ui/submit";
import type { LiveRow } from "@/server/repositories/live-catalog";
export function LiveOffers({ offers }: { offers: LiveRow[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Ofertas cadastradas</h2>
        <Link className="button dark" href="/admin/ofertas/nova">
          Cadastrar
        </Link>
      </div>
      {!offers.length ? (
        <p>Nenhuma oferta cadastrada. Comece pelo primeiro produto.</p>
      ) : (
        <>
          <p className="price-note">
            Até 200 registros recentes. Preço alterado ou verificação com mais
            de 24 horas retira a oferta do catálogo.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Produto / situação</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.title}</strong>
                      <br />
                      {o.status === "draft"
                        ? "Em revisão"
                        : o.status === "expired"
                          ? "Encerrada"
                          : "Publicada"}
                      <br />
                      <span className="muted">
                        Conferido:{" "}
                        {new Date(o.products.checked_at).toLocaleString(
                          "pt-BR",
                          { timeZone: "America/Sao_Paulo" },
                        )}
                      </span>
                    </td>
                    <td>
                      {formatMoney(o.price_cents)}
                      <br />
                      <span className="muted">
                        Atual: {formatMoney(o.products.current_price_cents)}
                      </span>
                    </td>
                    <td>
                      <div className="action-stack">
                        {o.status === "draft" && (
                          <>
                            <Link
                              className="text-link"
                              href={"/admin/ofertas/" + o.id + "/editar"}
                            >
                              Editar rascunho
                            </Link>
                            <form action={changeStatus}>
                              <input type="hidden" name="id" value={o.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="published"
                              />
                              <Submit>Aprovar e publicar</Submit>
                            </form>
                          </>
                        )}
                        {o.status !== "expired" && (
                          <>
                            <form action={confirmPrice}>
                              <input
                                type="hidden"
                                name="product_id"
                                value={o.product_id}
                              />
                              <Submit>
                                Conferi: preço atual continua válido
                              </Submit>
                            </form>
                            {o.products.provider === "mercado_livre" && (
                              <form action={refreshMarketPrice}>
                                <input
                                  type="hidden"
                                  name="product_id"
                                  value={o.product_id}
                                />
                                <Submit>
                                  Consultar preço no Mercado Livre
                                </Submit>
                              </form>
                            )}
                            <form action={changeStatus}>
                              <input type="hidden" name="id" value={o.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="expired"
                              />
                              <Submit>Encerrar oferta</Submit>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
