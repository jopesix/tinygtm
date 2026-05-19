import Anthropic from "@anthropic-ai/sdk";

// Default model: Claude Haiku 4.5 (locked in CEO plan 2026-05-17).
// Sonnet 4.6 is the upgrade lever — flip via ANTHROPIC_MODEL env.
export const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

// Cost table in micro-cents per million tokens.
// Source: Anthropic pricing as of late 2025. Update when models change.
// Haiku 4.5: $1/MTok input, $5/MTok output.
// Sonnet 4.6: $3/MTok input, $15/MTok output.
const COST_PER_MTOK_CENTS: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 100, output: 500 },
  "claude-haiku-4-5": { input: 100, output: 500 },
  "claude-sonnet-4-6": { input: 300, output: 1500 },
  "claude-sonnet-4-6-20251001": { input: 300, output: 1500 },
  "claude-opus-4-7": { input: 1500, output: 7500 },
};

export function estimateCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = COST_PER_MTOK_CENTS[model] ?? COST_PER_MTOK_CENTS[DEFAULT_MODEL];
  const cents = (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
  // Round up so the cost cap is conservative — undercounting is the bad failure mode.
  return Math.ceil(cents);
}
