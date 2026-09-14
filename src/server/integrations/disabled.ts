import type {
  AffiliateLinkProvider,
  ProductProvider,
  PublicationChannel,
} from "./contracts.ts";
// Explicitly unavailable adapters: no HTTP, side effects, or invented successes.
export const disabledProductProvider: ProductProvider = {
  async getProduct() {
    return { ok: false, error: { code: "not_configured" } };
  },
};
export const disabledAffiliateProvider: AffiliateLinkProvider = {
  async resolve() {
    return { ok: false, error: { code: "not_configured" } };
  },
};
export const disabledPublicationChannel: PublicationChannel = {
  async publish() {
    return {
      status: "failed",
      error: { code: "not_configured" },
      retryable: false,
    };
  },
};
