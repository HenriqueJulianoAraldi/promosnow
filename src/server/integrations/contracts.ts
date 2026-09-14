export type ProductSnapshot = {
  externalId: string;
  title: string;
  canonicalUrl: string;
  imageUrl?: string;
  priceCents: number;
  currency: "BRL";
  availability: "available" | "unavailable" | "unknown";
  observedAt: string;
};
export type IntegrationError = {
  code:
    | "not_configured"
    | "unauthorized"
    | "rate_limited"
    | "not_found"
    | "invalid_response"
    | "unavailable";
  retryAfterSeconds?: number;
};
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: IntegrationError };
export interface ProductProvider {
  getProduct(externalId: string): Promise<Result<ProductSnapshot>>;
}
export interface AffiliateLinkProvider {
  resolve(externalId: string): Promise<Result<{ destinationUrl: string }>>;
}
export type PublicationInput = { channelId: string; text: string };
export type PublicationResult =
  | { status: "sent"; messageId: string }
  | { status: "failed"; error: IntegrationError; retryable: boolean }
  | { status: "unknown"; reason: string };
export interface PublicationChannel {
  publish(input: PublicationInput): Promise<PublicationResult>;
}
