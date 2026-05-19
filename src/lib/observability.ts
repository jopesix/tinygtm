// No-op observability shim. Sentry + PostHog are intentionally deferred from
// FAQ Generator Milestone 2 (see memory: feedback_faq_generator_observability).
// Swap these bodies for real SDK calls when ready — no route changes required.

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function captureError(err: unknown, context?: EventProps): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error("[faq-generator]", message, { stack, ...context });
}

export function track(event: string, props?: EventProps): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[track]", event, props ?? {});
  }
}
