"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { mercadoLivreProvider } from "@/server/integrations/mercado-livre";
import { telegramChannel } from "@/server/integrations/telegram";
import { publicationText } from "@/domain/forms";
import { getAppConfig } from "@/server/env";
import { publicOffers } from "@/server/repositories/live-catalog";
export async function refreshMarketPrice(form: FormData) {
  const { db } = await requireAdmin();
  const id = String(form.get("product_id"));
  const { data: product } = await db
    .from("products")
    .select("id,external_id")
    .eq("id", id)
    .eq("provider", "mercado_livre")
    .maybeSingle();
  if (!product) redirect("/admin/ofertas?result=market_failed");
  const result = await mercadoLivreProvider(
    process.env.MERCADO_LIVRE_ACCESS_TOKEN,
    process.env.MERCADO_LIVRE_ENABLED === "true",
  ).getProduct(product.external_id);
  if (!result.ok)
    redirect(
      "/admin/ofertas?result=" +
        (result.error.code === "not_configured"
          ? "unconfigured"
          : "market_failed"),
    );
  const { error } = await db.rpc("record_market_price", {
    p_id: id,
    p_price: result.value.priceCents,
    p_available: result.value.availability === "available",
    p_key: randomUUID(),
  });
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  redirect(
    "/admin/ofertas?result=" + (error ? "market_failed" : "market_updated"),
  );
}
export async function publishTelegram(form: FormData) {
  const { db } = await requireAdmin();
  if (form.get("confirm") !== "yes")
    redirect("/admin/publicacoes?result=invalid");
  const channel = process.env.TELEGRAM_CHANNEL_ID;
  if (
    process.env.TELEGRAM_ENABLED !== "true" ||
    !process.env.TELEGRAM_BOT_TOKEN ||
    !channel
  )
    redirect("/admin/publicacoes?result=unconfigured");
  const slug = String(form.get("slug"));
  const offer = (await publicOffers(slug))[0];
  if (!offer) redirect("/admin/publicacoes?result=send_failed");
  const appUrl = getAppConfig().appUrl;
  if (!appUrl.startsWith("https://"))
    redirect("/admin/publicacoes?result=unconfigured");
  const text = publicationText(offer, appUrl);
  const { data: job, error } = await db.rpc("claim_publication", {
    p_id: offer.id,
    p_channel: channel,
    p_text: text,
  });
  if (error || !job) redirect("/admin/publicacoes?result=send_failed");
  const result = await telegramChannel(
    process.env.TELEGRAM_BOT_TOKEN,
    true,
  ).publish({ channelId: channel, text });
  const { error: finishError } = await db.rpc("finish_publication", {
    p_id: job.id,
    p_lease: job.lease_token,
    p_status: result.status,
    p_message: result.status === "sent" ? result.messageId : null,
    p_error:
      result.status === "failed"
        ? result.error.code
        : result.status === "unknown"
          ? result.reason
          : null,
  });
  revalidatePath("/admin/publicacoes");
  redirect(
    "/admin/publicacoes?result=" +
      (finishError || result.status === "unknown"
        ? "unknown"
        : result.status === "sent"
          ? "sent"
          : "send_failed"),
  );
}
