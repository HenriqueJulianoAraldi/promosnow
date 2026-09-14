import type { PublicationChannel } from "./contracts.ts";
export function telegramChannel(
  token: string | undefined,
  enabled: boolean,
  request: typeof fetch = fetch,
): PublicationChannel {
  return {
    async publish(input) {
      if (!enabled || !token)
        return {
          status: "failed",
          error: { code: "not_configured" },
          retryable: false,
        };
      if (
        !/^(@[A-Za-z0-9_]{5,}|-100\d+)$/.test(input.channelId) ||
        !input.text.trim() ||
        input.text.length > 4096
      )
        return {
          status: "failed",
          error: { code: "invalid_response" },
          retryable: false,
        };
      try {
        const response = await request(
          "https://api.telegram.org/bot" + token + "/sendMessage",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: input.channelId,
              text: input.text,
              link_preview_options: { is_disabled: true },
            }),
            redirect: "error",
            signal: AbortSignal.timeout(10000),
          },
        );
        const body = await response.json();
        if (
          response.ok &&
          body.ok === true &&
          Number.isSafeInteger(body.result?.message_id)
        )
          return { status: "sent", messageId: String(body.result.message_id) };
        if (
          body.ok === false &&
          [400, 401, 403, 404, 429].includes(body.error_code)
        )
          return {
            status: "failed",
            error: {
              code: body.error_code === 429 ? "rate_limited" : "unauthorized",
              retryAfterSeconds: body.parameters?.retry_after,
            },
            retryable: body.error_code === 429,
          };
        return { status: "unknown", reason: "unconfirmed_response" };
      } catch {
        return { status: "unknown", reason: "connection_interrupted" };
      }
    },
  };
}
