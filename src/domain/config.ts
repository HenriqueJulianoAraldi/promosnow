type Env = Record<string, string | undefined>;
export type AppConfig = {
  appUrl: string;
  environment: "local" | "preview" | "production";
  dataMode: "demo" | "supabase";
  demoAllowed: boolean;
  timezone: string;
  priceMaxAgeHours: number;
  jobBatchSize: number;
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
function integer(
  env: Env,
  name: string,
  fallback: number,
  max: number,
): number {
  const text = env[name];
  if (!text) return fallback;
  if (!/^\d+$/.test(text)) throw new ConfigurationError(name);
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n < 1 || n > max)
    throw new ConfigurationError(name);
  return n;
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
    required("SUPABASE_SECRET_KEY");
    try {
      if (new URL(env.NEXT_PUBLIC_SUPABASE_URL!).protocol !== "https:")
        throw new Error();
    } catch {
      throw new ConfigurationError("NEXT_PUBLIC_SUPABASE_URL");
    }
  }
  if (flag(env, "MERCADO_LIVRE_ENABLED")) {
    required("MERCADO_LIVRE_CLIENT_ID");
    required("MERCADO_LIVRE_CLIENT_SECRET");
    required("MERCADO_LIVRE_REDIRECT_URI");
    try {
      if (new URL(env.MERCADO_LIVRE_REDIRECT_URI!).protocol !== "https:")
        throw new Error();
    } catch {
      throw new ConfigurationError("MERCADO_LIVRE_REDIRECT_URI");
    }
  }
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
    priceMaxAgeHours: integer(env, "PRICE_MAX_AGE_HOURS", 24, 168),
    jobBatchSize: integer(env, "JOB_BATCH_SIZE", 10, 100),
  };
}
