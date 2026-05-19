// UTM URL building + validation + duplicate-detection helpers.

import { UtmFields, NamingRules, normalizeUtmFields, closestAllowed } from "./normalize";

export type ValidationIssue = {
  field: keyof UtmFields | "destination_url" | "form";
  level: "error" | "warning";
  message: string;
  suggestion?: string;
};

export function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Validate normalized fields. Returns a list of issues; empty = good to save.
// Warnings are non-blocking (e.g. existing UTM params on the destination URL).
export function validateFields(
  fields: UtmFields,
  rules: NamingRules,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!fields.destination_url) {
    issues.push({
      field: "destination_url",
      level: "error",
      message: "Destination URL is required.",
    });
  } else if (!isValidHttpUrl(fields.destination_url)) {
    issues.push({
      field: "destination_url",
      level: "error",
      message: "Destination URL must start with http:// or https://",
    });
  } else {
    try {
      const u = new URL(fields.destination_url);
      const existingUtms = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"]
        .filter((p) => u.searchParams.has(p));
      if (existingUtms.length > 0) {
        issues.push({
          field: "destination_url",
          level: "warning",
          message: `Destination URL already has ${existingUtms.join(", ")}. These will be overwritten.`,
        });
      }
    } catch {
      // unreachable — isValidHttpUrl guards above
    }
  }

  if (!fields.utm_source) {
    issues.push({ field: "utm_source", level: "error", message: "Source is required." });
  } else if (!rules.allowed_sources.includes(fields.utm_source)) {
    const closest = closestAllowed(fields.utm_source, rules.allowed_sources);
    issues.push({
      field: "utm_source",
      level: "warning",
      message: `"${fields.utm_source}" is not in your approved sources.`,
      suggestion: closest ?? undefined,
    });
  }

  if (!fields.utm_medium) {
    issues.push({ field: "utm_medium", level: "error", message: "Medium is required." });
  } else if (!rules.allowed_mediums.includes(fields.utm_medium)) {
    const closest = closestAllowed(fields.utm_medium, rules.allowed_mediums);
    issues.push({
      field: "utm_medium",
      level: "warning",
      message: `"${fields.utm_medium}" is not in your approved mediums.`,
      suggestion: closest ?? undefined,
    });
  }

  if (!fields.utm_campaign) {
    issues.push({ field: "utm_campaign", level: "error", message: "Campaign name is required." });
  }

  return issues;
}

// Build the final tracked URL. Strips any incoming utm_* params first so we
// don't double-stack them, then appends the normalized values. Non-UTM query
// params on the destination URL are preserved.
export function buildTrackedUrl(fields: UtmFields): string {
  const url = new URL(fields.destination_url);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"] as const;

  for (const k of utmKeys) {
    url.searchParams.delete(k);
  }

  url.searchParams.set("utm_source", fields.utm_source);
  url.searchParams.set("utm_medium", fields.utm_medium);
  url.searchParams.set("utm_campaign", fields.utm_campaign);
  if (fields.utm_id) url.searchParams.set("utm_id", fields.utm_id);
  if (fields.utm_term) url.searchParams.set("utm_term", fields.utm_term);
  if (fields.utm_content) url.searchParams.set("utm_content", fields.utm_content);

  return url.toString();
}

// Stable signature for exact-duplicate detection. We hash on normalized fields
// + the destination origin+path (querystring excluded) so trivial reordering or
// added unrelated params don't bypass the check.
export function computeDedupeKey(fields: UtmFields): string {
  let base = fields.destination_url;
  try {
    const u = new URL(fields.destination_url);
    base = `${u.origin}${u.pathname}`;
  } catch {
    // keep raw if not a valid URL — validateFields will surface that error
  }
  const parts = [
    base.toLowerCase(),
    fields.utm_source,
    fields.utm_medium,
    fields.utm_campaign,
    fields.utm_id ?? "",
    fields.utm_term ?? "",
    fields.utm_content ?? "",
  ];
  return parts.join("|");
}

// Convenience: normalize → validate → build → dedupe-key, in one pass.
export function buildLinkPayload(rawFields: UtmFields, rules: NamingRules) {
  const fields = normalizeUtmFields(rawFields, rules);
  const issues = validateFields(fields, rules);
  const hasErrors = issues.some((i) => i.level === "error");
  const generated_url = hasErrors ? "" : buildTrackedUrl(fields);
  const dedupe_key = computeDedupeKey(fields);
  return { fields, issues, generated_url, dedupe_key, hasErrors };
}
