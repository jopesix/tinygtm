// Normalization rules for UTM values.
//
// The PRD requires lowercase snake_case by default, with configurable separator
// and rule sets stored per user. We expose pure functions so the same logic can
// run server-side (API routes) and client-side (live preview while typing).

export type NamingRules = {
  force_lowercase: boolean;
  separator: "_" | "-";
  allowed_sources: string[];
  allowed_mediums: string[];
};

export const DEFAULT_RULES: NamingRules = {
  force_lowercase: true,
  separator: "_",
  allowed_sources: [
    "google",
    "linkedin",
    "facebook",
    "instagram",
    "twitter",
    "tiktok",
    "youtube",
    "reddit",
    "newsletter",
    "partner",
    "direct",
    "referral",
  ],
  allowed_mediums: [
    "cpc",
    "paid_social",
    "organic_social",
    "email",
    "referral",
    "affiliate",
    "partner",
    "display",
    "video",
    "organic",
    "sms",
    "push",
  ],
};

// Normalize a single UTM-style token (source, medium, campaign, term, content, id).
// Strips accents, lowercases, collapses whitespace + unsupported chars to the
// configured separator, and trims leading/trailing separators.
export function normalizeToken(input: string, rules: NamingRules = DEFAULT_RULES): string {
  if (!input) return "";

  let v = input.trim();

  // Strip combining marks (é → e)
  v = v.normalize("NFKD").replace(/[̀-ͯ]/g, "");

  if (rules.force_lowercase) {
    v = v.toLowerCase();
  }

  const sep = rules.separator;
  const otherSep = sep === "_" ? "-" : "_";

  // Convert the "wrong" separator and whitespace + special chars to the chosen separator.
  v = v.replace(/\s+/g, sep);
  v = v.replaceAll(otherSep, sep);
  v = v.replace(/[^a-z0-9_\-]/gi, sep);

  // Collapse repeated separators and trim them from the edges.
  const sepRe = new RegExp(`\\${sep}+`, "g");
  v = v.replace(sepRe, sep);
  v = v.replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");

  return v;
}

// Compute the closest allowed value via case-insensitive substring match.
// Used for source/medium suggestions when the user types something off-list.
export function closestAllowed(value: string, allowed: string[]): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  const exact = allowed.find((a) => a.toLowerCase() === v);
  if (exact) return exact;
  const prefix = allowed.find((a) => a.toLowerCase().startsWith(v));
  if (prefix) return prefix;
  const contains = allowed.find((a) => a.toLowerCase().includes(v));
  return contains ?? null;
}

export type UtmFields = {
  destination_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_id?: string;
  utm_term?: string;
  utm_content?: string;
};

export function normalizeUtmFields(
  fields: UtmFields,
  rules: NamingRules = DEFAULT_RULES,
): UtmFields {
  return {
    destination_url: fields.destination_url.trim(),
    utm_source: normalizeToken(fields.utm_source, rules),
    utm_medium: normalizeToken(fields.utm_medium, rules),
    utm_campaign: normalizeToken(fields.utm_campaign, rules),
    utm_id: fields.utm_id ? normalizeToken(fields.utm_id, rules) : undefined,
    utm_term: fields.utm_term ? normalizeToken(fields.utm_term, rules) : undefined,
    utm_content: fields.utm_content ? normalizeToken(fields.utm_content, rules) : undefined,
  };
}
