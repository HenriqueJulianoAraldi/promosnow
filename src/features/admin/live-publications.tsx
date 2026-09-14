import { requireAdmin } from "@/server/auth/admin";
import { publicOffers } from "@/server/repositories/live-catalog";
import { publicationText } from "@/domain/forms";
import { parseConfig } from "@/domain/config";
import { publishTelegram } from "@/server/actions/integrations";
import { Submit } from "@/components/ui/submit";
export async function LivePublications() {
  const { db } = await requireAdmin();
  const offers = await publicOffers();
  const { data: jobs, error } = await db
    .from("telegram_publications")
    .select("id,offer_id,channel_id,status,created_at,error_code,message_text")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Não foi possível carregar as publicações.");
  const configured =
    process.env.TELEGRAM_ENABLED === "true" &&
    !!process.env.TELEGRAM_BOT_TOKEN &&
    !!process.env.TELEGRAM_CHANNEL_ID &&
    parseConfig(process.env).appUrl.startsWith("https://");
  return (
    <>
      <section className="panel">
        <h2>Prévia e envio</h2>
        <p>
          Canal de destino:{" "}
          <strong>{process.env.TELEGRAM_CHANNEL_ID ?? "a configurar"}</strong>
        </p>
        <p>
          Confira a mensagem e confirme o envio para o canal configurado. Cada
          oferta pode ser enviada uma única vez por canal nesta versão.
        </p>
        {!configured && (
          <p>
            Telegram ainda não configurado. As prévias estão disponíveis abaixo.
          </p>
        )}
        {!offers.length && (
          <p>
            Publique uma oferta válida no catálogo para preparar a divulgação.
          </p>
        )}
        {offers.map((o) => {
          const requested = jobs?.some(
            (j) =>
              j.offer_id === o.id &&
              j.channel_id === process.env.TELEGRAM_CHANNEL_ID,
          );
          return (
            <form className="send-form" action={publishTelegram} key={o.id}>
              <input type="hidden" name="slug" value={o.slug} />
              <pre>{publicationText(o, parseConfig(process.env).appUrl)}</pre>
              <label>
                <input
                  type="checkbox"
                  required
                  name="confirm"
                  value="yes"
                  disabled={requested || !configured}
                />{" "}
                Revisei e quero enviar esta mensagem ao canal.
              </label>
              <Submit disabled={requested || !configured}>
                {requested ? "Envio já solicitado" : "Enviar ao Telegram"}
              </Submit>
            </form>
          );
        })}
      </section>
      <section className="panel">
        <h2>Histórico</h2>
        <p>
          Se um envio ficar em processamento por mais de dois minutos, trate o
          resultado como incerto e confira o canal. Nenhum reenvio é automático.
        </p>
        {!jobs?.length ? (
          <p>Nenhuma publicação solicitada.</p>
        ) : (
          jobs.map((j) => (
            <article className="publication-record" key={j.id}>
              <strong>
                {j.status === "sent"
                  ? "Enviada"
                  : j.status === "failed"
                    ? "Falhou"
                    : j.status === "unknown"
                      ? "Resultado incerto"
                      : "Em processamento — conferir canal se não concluir"}
              </strong>
              <p>
                {new Date(j.created_at).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
              <pre>{j.message_text}</pre>
            </article>
          ))
        )}
      </section>
    </>
  );
}
