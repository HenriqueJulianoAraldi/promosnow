import { createHmac } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { getAppState } from "@/server/env";
import { publicDb, privilegedDb } from "@/server/supabase/client";
import { safeUrl } from "@/domain/forms";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (getAppState() !== "live" || !/^([a-f0-9]){32}$/.test(code))
    return new NextResponse("Oferta indisponível.", { status: 404 });
  const { data: destination, error } = await publicDb().rpc("resolve_link", {
    p_code: code,
  });
  if (error)
    return new NextResponse("Não foi possível consultar esta oferta.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  if (!destination || !safeUrl(destination, "affiliate"))
    return new NextResponse("Oferta indisponível.", { status: 404 });
  const source =
    request.nextUrl.searchParams.get("source") === "telegram"
      ? "telegram"
      : "site";
  const agent = request.headers.get("user-agent") ?? "";
  const secret = process.env.RATE_LIMIT_HASH_SECRET;
  const ip = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (
    secret &&
    ip &&
    !/bot|crawler|spider|preview|facebook|telegram/i.test(agent)
  ) {
    const key = createHmac("sha256", secret)
      .update(code + "|" + ip + "|" + Math.floor(Date.now() / 600000))
      .digest("hex");
    after(async () => {
      try {
        const db = privilegedDb();
        if (db)
          await db.rpc("record_click", {
            p_code: code,
            p_source: source,
            p_key: key,
          });
      } catch {
        /* Metrics must not interrupt the redirect. */
      }
    });
  }
  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export async function HEAD() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET", "Cache-Control": "no-store" },
  });
}
