// Campaign Operations Planner — zod schemas.
// Two-step AI flow: classify → confirm → generate plan. PRD locked 2026-05-19.
// Phase 2 replaces the AI plan call with a rules engine + 12 templates.

import { z } from "zod";

export const MAX_CAMPAIGN_SOURCE = 50_000;

// ---------- Taxonomies (PRD §10) ----------

export const CampaignType = z.enum([
  "product_launch",
  "feature_launch",
  "webinar",
  "paid_acquisition",
  "content_campaign",
  "pr_announcement",
  "event_launch",
  "lifecycle_campaign",
  "outbound_campaign",
  "ecommerce_campaign",
  "partnership_campaign",
  "other",
]);

export const BusinessType = z.enum([
  "b2b_saas",
  "b2c",
  "ecommerce",
  "agency",
  "marketplace",
  "media_community",
  "enterprise_software",
  "other",
]);

export const TeamStructure = z.enum([
  "solo_marketer",
  "startup_team",
  "in_house_team",
  "agency_led",
  "enterprise_team",
]);

export const GtmMotion = z.enum([
  "sales_led",
  "product_led",
  "self_serve",
  "outbound_led",
  "ecommerce",
  "hybrid",
]);

export const Channel = z.enum([
  "email",
  "paid_social",
  "organic_social",
  "paid_search",
  "website",
  "webinar",
  "seo_content",
  "pr",
  "partnerships",
  "sales_outbound",
  "in_app",
  "events",
]);

export const LaunchComplexity = z.enum(["low", "medium", "high"]);
export const LaunchPhase = z.enum(["pre_launch", "launch_day", "post_launch"]);
export const Priority = z.enum(["must_have", "should_have", "optional"]);
export const Severity = z.enum(["low", "medium", "high"]);

export const Category = z.enum([
  "strategy",
  "messaging",
  "creative",
  "website",
  "email",
  "paid_media",
  "organic_social",
  "webinar",
  "outbound",
  "analytics",
  "qa",
  "internal_comms",
  "support_enablement",
  "launch_day",
  "post_launch",
]);

// ---------- Display labels (server + client) ----------

export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  product_launch: "Product launch",
  feature_launch: "Feature launch",
  webinar: "Webinar",
  paid_acquisition: "Paid acquisition campaign",
  content_campaign: "Content campaign",
  pr_announcement: "PR announcement",
  event_launch: "Event launch",
  lifecycle_campaign: "Lifecycle campaign",
  outbound_campaign: "Outbound campaign",
  ecommerce_campaign: "Ecommerce campaign",
  partnership_campaign: "Partnership campaign",
  other: "Other",
};

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c: "B2C",
  ecommerce: "Ecommerce",
  agency: "Agency",
  marketplace: "Marketplace",
  media_community: "Media / community",
  enterprise_software: "Enterprise software",
  other: "Other",
};

export const TEAM_STRUCTURE_LABELS: Record<string, string> = {
  solo_marketer: "Solo marketer",
  startup_team: "Startup team",
  in_house_team: "In-house team",
  agency_led: "Agency-led",
  enterprise_team: "Enterprise team",
};

export const GTM_MOTION_LABELS: Record<string, string> = {
  sales_led: "Sales-led",
  product_led: "Product-led",
  self_serve: "Self-serve",
  outbound_led: "Outbound-led",
  ecommerce: "Ecommerce",
  hybrid: "Hybrid",
};

export const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  paid_social: "Paid social",
  organic_social: "Organic social",
  paid_search: "Paid search",
  website: "Website",
  webinar: "Webinar",
  seo_content: "SEO / content",
  pr: "PR",
  partnerships: "Partnerships",
  sales_outbound: "Sales outbound",
  in_app: "In-app",
  events: "Events",
};

export const CATEGORY_LABELS: Record<string, string> = {
  strategy: "Strategy",
  messaging: "Messaging",
  creative: "Creative",
  website: "Website",
  email: "Email",
  paid_media: "Paid media",
  organic_social: "Organic social",
  webinar: "Webinar",
  outbound: "Outbound",
  analytics: "Analytics",
  qa: "QA",
  internal_comms: "Internal comms",
  support_enablement: "Support enablement",
  launch_day: "Launch day",
  post_launch: "Post-launch",
};

// ---------- Request schemas ----------

export const ClassifyRequestSchema = z.object({
  source_text: z.string().trim().min(50).max(MAX_CAMPAIGN_SOURCE),
  source_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be http(s) URL")
    .optional()
    .or(z.literal("").optional()),
});

export type ClassifyRequest = z.infer<typeof ClassifyRequestSchema>;

export const ClassificationSchema = z.object({
  campaign_name: z.string().min(2).max(160),
  campaign_type: CampaignType,
  business_type: BusinessType,
  team_structure: TeamStructure,
  gtm_motion: GtmMotion,
  channels: z.array(Channel).min(1).max(8),
  launch_complexity: LaunchComplexity,
});

export type Classification = z.infer<typeof ClassificationSchema>;

export const PlanGenerateRequestSchema = z.object({
  source_text: z.string().trim().min(50).max(MAX_CAMPAIGN_SOURCE),
  source_url: z.string().trim().max(500).optional(),
  classification: ClassificationSchema,
});

export type PlanGenerateRequest = z.infer<typeof PlanGenerateRequestSchema>;

// ---------- AI response shapes ----------

export const TaskSchema = z.object({
  task: z.string().min(5).max(300),
  category: Category,
  suggested_owner: z.string().max(80).default(""),
  launch_phase: LaunchPhase,
  priority: Priority,
  dependency: z.string().max(200).default(""),
  notes: z.string().max(400).default(""),
});

export const GapSchema = z.object({
  description: z.string().min(5).max(300),
  area: z.string().max(60).default(""),
  severity: Severity.default("medium"),
});

export const PlanAiSchema = z.object({
  tasks: z.array(TaskSchema).min(8).max(40),
  gaps: z.array(GapSchema).max(15).default([]),
});

export type Task = z.infer<typeof TaskSchema>;
export type Gap = z.infer<typeof GapSchema>;
export type PlanAi = z.infer<typeof PlanAiSchema>;
