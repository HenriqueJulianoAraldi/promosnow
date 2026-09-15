import "server-only";
import { redirect } from "next/navigation";
import { getAppState } from "@/server/env";
import { sessionDb } from "@/server/supabase/client";
export async function requireAdmin() {
  if (getAppState() !== "live") redirect("/entrar");
  const db = await sessionDb();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/entrar");
  const { data: admin, error: membershipError } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError || !admin) redirect("/entrar?result=forbidden");
  return { db, user };
}
