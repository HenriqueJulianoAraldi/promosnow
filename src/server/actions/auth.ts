"use server";
import { redirect } from "next/navigation";
import { getAppState } from "@/server/env";
import { sessionDb } from "@/server/supabase/client";
export async function signIn(form: FormData) {
  if (getAppState() !== "live") redirect("/entrar");
  const email = String(form.get("email") ?? "").trim(),
    password = String(form.get("password") ?? "");
  if (email.length > 254 || password.length > 200 || !email || !password)
    redirect("/entrar?result=invalid_login");
  const db = await sessionDb();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) redirect("/entrar?result=invalid_login");
  redirect("/admin");
}
export async function signOut() {
  if (getAppState() === "live") {
    const db = await sessionDb();
    await db.auth.signOut();
  }
  redirect("/entrar");
}
