import "server-only";
import { ConfigurationError, parseConfig } from "@/domain/config";
export function getAppState(): "demo" | "setup" {
  try {
    return parseConfig(process.env).demoAllowed ? "demo" : "setup";
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
