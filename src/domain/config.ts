type Env = Record<string, string | undefined>;
export type AppConfig = {
  appUrl: string;
  environment: "local" | "preview" | "production";
  dataMode: "demo" | "supabase";
  demoAllowed: boolean;
  timezone: string;
};
export class ConfigurationError extends Error {
  readonly field: string;
  constructor(field: string) {
    super(`Configuração inválida: ${field}`);
    this.field = field;
  }
}
function flag(env: Env, name: string): boolean {
  const value = env[name] || "false";
  if (value !== "true" && value !== "false") throw new ConfigurationError(name);
  return value === "true";
}
export function parseConfig(env: Env): AppConfig {
  const environment =
    env.VERCEL_ENV === "production"
      ? "production"
      : env.VERCEL_ENV === "preview"
        ? "preview"
        : env.APP_ENV ||
          (env.NODE_ENV === "production" ? "production" : "local");
  if (!["local", "preview", "production"].includes(environment))
    throw new ConfigurationError("APP_ENV");
  const dataMode = env.DATA_MODE || "demo";
  if (dataMode !== "demo" && dataMode !== "supabase")
    throw new ConfigurationError("DATA_MODE");
  const appUrl = env.APP_URL || "http://localhost:3000";
  try {
    const url = new URL(appUrl);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
  } catch {
    throw new ConfigurationError("APP_URL");
  }
  const timezone = env.APP_TIMEZONE || "America/Sao_Paulo";
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: timezone });
  } catch {
    throw new ConfigurationError("APP_TIMEZONE");
  }
  const required = (name: string) => {
    if (!env[name]?.trim()) throw new ConfigurationError(name);
  };
  if (dataMode === "supabase") {
    required("NEXT_PUBLIC_SUPABASE_URL");
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

    try {
      if (new URL(env.NEXT_PUBLIC_SUPABASE_URL!).protocol !== "https:")
        throw new Error();
    } catch {
      throw new ConfigurationError("NEXT_PUBLIC_SUPABASE_URL");
    }
  }
  if (flag(env, "MERCADO_LIVRE_ENABLED"))
    required("MERCADO_LIVRE_ACCESS_TOKEN");
  if (flag(env, "TELEGRAM_ENABLED")) {
    required("TELEGRAM_BOT_TOKEN");
    required("TELEGRAM_CHANNEL_ID");
  }
  return {
    appUrl,
    environment: environment as AppConfig["environment"],
    dataMode,
    demoAllowed: dataMode === "demo" && environment !== "production",
    timezone,
  };
}
