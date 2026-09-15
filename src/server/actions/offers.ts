"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { offerInput, parsePrice } from "@/domain/forms";
import { requireAdmin } from "@/server/auth/admin";
function done(code: string): never {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  redirect("/admin/ofertas?result=" + code);
}
export async function saveOffer(form: FormData) {
  const { db } = await requireAdmin();
  const fields = Object.fromEntries(form.entries());
  const local = String(fields.expires_at ?? "");
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)
    ? local + ":00-03:00"
    : local;
  const result = offerInput.safeParse({
    ...fields,
    expires_at: iso,
    price_cents: parsePrice(String(fields.price ?? "")),
    reference_price_cents: fields.reference_price
      ? parsePrice(String(fields.reference_price))
      : null,
  });
  if (
    !result.success ||
    (fields.reference_price && result.data.reference_price_cents === null)
  )
    done("invalid");
  const { error } = await db.rpc("save_offer", { payload: result.data });
  done(error ? "db" : "saved");
}
export async function changeStatus(form: FormData) {
  const { db } = await requireAdmin();
  const id = String(form.get("id")),
    status = String(form.get("status"));
  if (!/^[a-f0-9-]{36}$/.test(id) || !["published", "expired"].includes(status))
    done("invalid");
  const { error } = await db.rpc("set_offer_status", {
    p_id: id,
    p_status: status,
  });
  done(error ? "db" : status);
}
export async function confirmPrice(form: FormData) {
  const { db } = await requireAdmin();
  const id = String(form.get("product_id"));
  if (!/^[a-f0-9-]{36}$/.test(id)) done("invalid");
  const { error } = await db.rpc("confirm_price", { p_id: id });
  done(error ? "db" : "checked");
}
