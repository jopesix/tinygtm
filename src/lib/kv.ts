// Upstash Redis client (Vercel KV-compatible) for rate-limiting + monthly cost cap.
// Fail-open: if KV creds are missing or the call throws, we let the request proceed.
// Damage is bounded by Vercel function concurrency + the upstream Anthropic key cap.

import { Redis } from "@upstash/redis";
import { captureError } from "./observability";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export const ANON_PER_DAY_DEFAULT = 3;
export const USER_PER_DAY_DEFAULT = 20;
export const MONTHLY_COST_CAP_CENTS_DEFAULT = 2000; // $20

export function anonPerDay(): number {
  const raw = Number(process.env.RATE_LIMIT_ANON_PER_DAY);
  return Number.isFinite(raw) && raw > 0 ? raw : ANON_PER_DAY_DEFAULT;
}

export function userPerDay(): number {
  const raw = Number(process.env.RATE_LIMIT_USER_PER_DAY);
  return Number.isFinite(raw) && raw > 0 ? raw : USER_PER_DAY_DEFAULT;
}

export function monthlyCostCapCents(): number {
  const raw = Number(process.env.MONTHLY_COST_CAP_USD);
  if (Number.isFinite(raw) && raw > 0) return Math.round(raw * 100);
  return MONTHLY_COST_CAP_CENTS_DEFAULT;
}

function dayBucket(date = new Date()): string {
  // UTC day, e.g. "2026-05-18"
  return date.toISOString().slice(0, 10);
}

function monthBucket(date = new Date()): string {
  // UTC month, e.g. "2026-05"
  return date.toISOString().slice(0, 7);
}

export type RateLimitResult = {
  ok: boolean;
  used: number;
  limit: number;
  bypassed?: boolean; // true when KV is unavailable (fail-open)
};

/**
 * Atomically increment the per-day counter for this subject and check the cap.
 * Subject is "ip:1.2.3.4" for anonymous, "user:<uuid>" for signed-in.
 * One day TTL is set on first increment so old buckets self-expire.
 */
export async function checkAndIncrementDailyLimit(
  subject: string,
  limit: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { ok: true, used: 0, limit, bypassed: true };

  const key = `faqgen:rl:${subject}:${dayBucket()}`;
  try {
    const used = await redis.incr(key);
    if (used === 1) {
      // First hit today — expire in 36h so the bucket disappears after the day ends.
      await redis.expire(key, 60 * 60 * 36);
    }
    return { ok: used <= limit, used, limit };
  } catch (err) {
    captureError(err, { where: "kv.checkAndIncrementDailyLimit", subject });
    return { ok: true, used: 0, limit, bypassed: true };
  }
}

/**
 * Decrement a prior rate-limit increment. Used when generation fails before any
 * Anthropic spend so the user doesn't lose a slot for our error.
 */
export async function refundDailyLimit(subject: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = `faqgen:rl:${subject}:${dayBucket()}`;
  try {
    await redis.decr(key);
  } catch (err) {
    captureError(err, { where: "kv.refundDailyLimit", subject });
  }
}

export type CostCapResult = {
  ok: boolean;
  spentCents: number;
  capCents: number;
  bypassed?: boolean;
};

/**
 * Read the current month's spend and decide whether to allow the request.
 * Allows the request if spend is under the cap; the actual cost is added AFTER
 * generation via addMonthlyCostCents.
 */
export async function checkMonthlyCostCap(): Promise<CostCapResult> {
  const redis = getRedis();
  const cap = monthlyCostCapCents();
  if (!redis) return { ok: true, spentCents: 0, capCents: cap, bypassed: true };

  const key = `faqgen:cost:${monthBucket()}`;
  try {
    const spent = (await redis.get<number>(key)) ?? 0;
    return { ok: spent < cap, spentCents: spent, capCents: cap };
  } catch (err) {
    captureError(err, { where: "kv.checkMonthlyCostCap" });
    return { ok: true, spentCents: 0, capCents: cap, bypassed: true };
  }
}

export async function addMonthlyCostCents(cents: number): Promise<void> {
  if (cents <= 0) return;
  const redis = getRedis();
  if (!redis) return;
  const key = `faqgen:cost:${monthBucket()}`;
  try {
    await redis.incrby(key, cents);
    // 40-day TTL — beyond a month, the bucket key isn't current anyway.
    await redis.expire(key, 60 * 60 * 24 * 40);
  } catch (err) {
    captureError(err, { where: "kv.addMonthlyCostCents", cents });
  }
}
