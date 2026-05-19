// Drop-in JSON-LD <script> with safe HTML-escaping. Pass any plain object and
// it'll render the structured data Google + LLM crawlers expect.

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      // The data is fully under our control — no user input — so this is safe.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
