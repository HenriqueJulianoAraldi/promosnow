import "server-only";
import { ConfigurationError, parseConfig } from "@/domain/config";
// Use direct reads so Next.js can inline NEXT_PUBLIC values at build time.
// This must match the reads used by the Supabase clients and proxy.
export function getAppConfig() {
  return parseConfig({
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getAppState(): "demo" | "setup" | "live" {
  try {
    const config = getAppConfig();
    return config.dataMode === "supabase"
      ? "live"
      : config.demoAllowed
        ? "demo"
        : "setup";
  } catch (error) {
    // Only the field name is logged. Never log process.env or credential values.
    console.error({
      operation: "config",
      code: "invalid_config",
      field: error instanceof ConfigurationError ? error.field : "unknown",
      reason: error instanceof ConfigurationError ? error.reason : "unknown",
    });
    return "setup";
  }
}
