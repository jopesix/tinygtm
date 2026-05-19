# Evals

Runs the FAQ Generator against 5 sample products and asserts that the output
meets golden criteria. The safety net for prompt + model changes.

## Run

```bash
npm run eval               # all 5 fixtures, golden checks only — ~$0.05
EVAL_USE_JUDGE=1 npm run eval   # also runs the Sonnet judge — ~$0.30
```

Requires `ANTHROPIC_API_KEY` in `.env.local`. The runner imports `dotenv/config`
so it picks it up automatically.

## What it checks

Per fixture:

| Check | What it asserts |
|---|---|
| **Valid JSON** | Output parses, FAQ count is in `[minFaqs, maxFaqs]` |
| **Required categories** | At least one FAQ in each listed category appears |
| **Required gap types** | The Missing Context Detector flags expected gaps |
| **Substring presence** | At least one product-specific term appears in the FAQs |
| **Forbidden phrasings** | No prompt-injection leaks (e.g. "ignore previous instructions") |
| **Sonnet judge** (optional) | Score ≥ rubric threshold, with a written critique |

## Fixtures

1. **B2B SaaS analytics** — warehouse-native PulseMetrics. Pricing intentionally TBD.
2. **E-commerce checkout** — OneTap. Pricing absent, security explicit.
3. **API/dev tool** — EdgeRunner. Explicit pricing + limits.
4. **Mobile productivity** — Margin (ADHD focus app). Pricing absent, low-overwhelm tone.
5. **Agency white-label** — BrandLoop. Multi-tenant, pricing absent.

## When to run

- Before changing `src/lib/prompts/faq.ts`
- Before swapping `ANTHROPIC_MODEL`
- Before changing the response schema in `src/lib/schemas/generate.ts`
- On a cadence (weekly?) to catch upstream model drift

A regression here means the prompt change broke at least one fixture's golden
expectations. Investigate before promoting the change.
