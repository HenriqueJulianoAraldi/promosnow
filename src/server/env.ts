import "server-only";
import { ConfigurationError, parseConfig } from "@/domain/config";
export function getAppState(): "demo" | "setup" | "live" {
  try {
    const config = parseConfig(process.env);
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
    });
    return "setup";
  }
}
