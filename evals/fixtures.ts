// 5 sample products covering different SaaS shapes. Inputs are designed to
// stress the prompt — intentional gaps for the missing-context detector to
// catch, persona-relevant framing, varied length.

import type { Fixture } from "./golden";

export const FIXTURES: Fixture[] = [
  {
    id: "b2b-analytics",
    name: "B2B SaaS analytics platform (data + integrations heavy)",
    inputs: {
      product_description:
        "PulseMetrics is a self-serve product analytics platform for B2B SaaS teams. We unify product, marketing, and CRM events into one warehouse-native dataset so PMs and growth teams can answer activation, retention, and revenue-attribution questions without needing a data engineer.",
      product_url: "https://pulsemetrics.example",
      target_audience:
        "Product managers and growth leads at 50-500 employee B2B SaaS companies, where engineering bandwidth for instrumentation is limited.",
      key_problem:
        "Teams have product, marketing, and CRM data scattered across Mixpanel, Salesforce, and HubSpot — making it impossible to answer cross-functional questions like 'which signup channel produces the highest 30-day retention?'",
      persona: "Product managers and growth leads at B2B SaaS scale-ups",
      resource_type: "prd",
      resource_text:
        "PRD v3 — PulseMetrics activation report. Goal: surface activation drop-off by acquisition channel. We connect to Snowflake/BigQuery as the source of truth (warehouse-native model). Integrations launching at GA: Segment, Rudderstack, HubSpot, Salesforce. The activation report shows time-to-first-value cohorts. Pricing — TBD (working with finance).",
      faq_destination: "sales_page",
      focus_areas: ["features", "integrations", "use_cases", "comparisons"],
      main_value_prop:
        "Warehouse-native means your data never leaves Snowflake — security and compliance teams approve in days, not months.",
    },
    expect: {
      minFaqs: 6,
      maxFaqs: 14,
      mustHaveCategories: ["workflow_and_integration", "product_understanding"],
      mustHaveGapTypes: ["missing_pricing_context"], // PRD says "Pricing — TBD"
      mustMentionAny: ["Snowflake", "warehouse", "integration"],
      mustNotMention: ["ignore previous instructions"],
    },
    judge: {
      rubric:
        "Score how well the FAQs (a) sound like a real B2B buyer wrote the questions, (b) ground every answer in the warehouse-native model and named integrations, (c) avoid inventing pricing or features not in the PRD.",
      minScore: 7,
    },
  },

  {
    id: "ecommerce-checkout",
    name: "E-commerce checkout tool (transaction + security focused)",
    inputs: {
      product_description:
        "OneTap Checkout is a one-click checkout drop-in for Shopify and WooCommerce stores. Customers paying once on any OneTap-enabled store can check out anywhere in our network in two clicks — no form filling, no account creation.",
      product_url: "https://onetap.example",
      target_audience:
        "DTC e-commerce store owners doing $500K-$10M GMV who care about checkout conversion and cart abandonment.",
      key_problem:
        "Mobile checkout conversion is 50% lower than desktop because customers abandon when faced with shipping/billing form fields on a small screen.",
      persona: "DTC store owners and operators",
      resource_type: "release_notes",
      resource_text:
        "v2.4 release — Added Apple Pay fallback when OneTap network match fails. Added 3DS step-up for transactions over $250 (configurable). Now supports Shopify Hydrogen storefronts in beta. Bug fix: Safari ITP cookie issue fixed.",
      faq_destination: "sales_page",
      focus_areas: ["features", "setup", "integrations", "security", "comparisons"],
      main_value_prop:
        "Stores see 18-32% mobile checkout lift in the first 30 days, with no developer work beyond installing the Shopify app.",
    },
    expect: {
      minFaqs: 6,
      maxFaqs: 14,
      mustHaveCategories: ["product_understanding", "workflow_and_integration"],
      mustHaveGapTypes: ["missing_pricing_context"], // pricing absent from input
      mustMentionAny: ["Shopify", "checkout", "conversion"],
      mustNotMention: ["ignore previous instructions"],
    },
    judge: {
      rubric:
        "Score whether the FAQs lean into checkout-conversion language a DTC operator would care about, address fraud / security concerns naturally, and don't invent stats not present in the inputs.",
      minScore: 7,
    },
  },

  {
    id: "api-developer-tool",
    name: "API/developer tool (technical + pricing/limits)",
    inputs: {
      product_description:
        "EdgeRunner is a serverless code-runner API. POST your code (Python, TypeScript, Go, or Rust) and EdgeRunner runs it in an isolated micro-VM in <50ms cold-start. Useful for AI agent tool calls, customer-supplied scripts, and untrusted code evaluation.",
      product_url: "https://edgerunner.example",
      target_audience:
        "Engineers building AI agent products, no-code platforms, and any app where customer-supplied code needs to run safely.",
      key_problem:
        "Running untrusted code in production means choosing between security risk (eval/Docker) and operational pain (k8s + sandboxing). Existing serverless platforms have 5-30s cold starts that break interactive UX.",
      persona: "Engineers building AI agent platforms or accepting customer-supplied code",
      resource_type: "help_doc",
      resource_text:
        "Pricing: $5/million invocations OR $50/month for the Pro tier (10M invocations + dedicated VPC). Memory: 512MB default, configurable to 4GB. Max execution: 300s. SDK: JavaScript, Python, Go, Rust. SOC 2 Type II — yes. HIPAA — coming Q4.",
      faq_destination: "sales_page",
      focus_areas: ["pricing", "features", "security", "limitations", "comparisons"],
      main_value_prop:
        "Under 50ms cold-start with full isolation. The only serverless runtime designed for synchronous AI agent tool calls.",
    },
    expect: {
      minFaqs: 6,
      maxFaqs: 14,
      mustHaveCategories: [
        "pricing_and_access",
        "technical_clarification",
        "product_understanding",
      ],
      mustHaveGapTypes: [],
      mustMentionAny: ["50ms", "$5", "$50"],
      mustNotMention: ["ignore previous instructions"],
    },
    judge: {
      rubric:
        "Score whether the answers correctly reference the explicit pricing tiers, runtime limits, and language SDKs from the doc, without inventing additional ones.",
      minScore: 7,
    },
  },

  {
    id: "mobile-productivity",
    name: "Mobile productivity app (consumer + UX focused)",
    inputs: {
      product_description:
        "Margin is a focus app for neurodivergent adults. It builds a 'today' from your calendar, todo lists, and inbox, then walks you through one thing at a time in low-overwhelm mode.",
      product_url: "https://margin.example",
      target_audience: "Adults with ADHD who struggle to start tasks even when they know what needs doing.",
      key_problem:
        "Productivity apps assume you can self-prioritize and time-box. Margin assumes you can't — and does that for you, then nudges you through it.",
      persona: "Neurodivergent adults — ADHD, autistic, executive function difficulties",
      resource_type: "customer_interview",
      resource_text:
        "Interview, Sara (ADHD): 'I open Things or Todoist and just close it because looking at 47 tasks shuts me down. I need someone to tell me what to do next. I don't need more features, I need fewer choices.'",
      faq_destination: "launch_page",
      focus_areas: ["features", "use_cases", "comparisons", "general"],
      main_value_prop:
        "We pick what you do next. You don't decide, you just start. The interface shows one thing at a time, never a list.",
    },
    expect: {
      minFaqs: 6,
      maxFaqs: 14,
      mustHaveCategories: ["product_understanding", "feature_clarification"],
      mustHaveGapTypes: ["missing_pricing_context", "missing_implementation_details"],
      mustMentionAny: ["ADHD", "focus", "one thing"],
      mustNotMention: ["ignore previous instructions"],
    },
    judge: {
      rubric:
        "Score whether the FAQ tone matches a calm, low-overwhelm consumer app for ADHD adults — and whether the answers respect the 'we pick, you start' positioning instead of pivoting to feature lists.",
      minScore: 7,
    },
  },

  {
    id: "agency-whitelabel",
    name: "Agency white-label tool (multi-tenant + branding)",
    inputs: {
      product_description:
        "BrandLoop is a white-label customer portal for marketing agencies. Each agency client gets a branded login, asset library, and approval workflow under the agency's own domain.",
      product_url: "https://brandloop.example",
      target_audience: "Marketing agencies with 5-50 clients managing creative deliverables.",
      key_problem:
        "Agencies email files, get lost-in-Slack approvals, and have no audit trail. BrandLoop replaces 'where did we land on this?' with a real workflow per client.",
      persona: "Agency owners and account leads at small-to-mid creative shops",
      resource_type: "prd",
      resource_text:
        "MVP scope: Multi-tenant clients with isolated workspaces. Custom subdomain per client (e.g. acme.brandloop.example). Approval state machine: draft → in-review → approved → revisions-requested. SSO for client side: Google OAuth in v1, SAML in v2.",
      faq_destination: "internal_enablement",
      focus_areas: ["setup", "security", "data_and_privacy", "features", "limitations"],
      main_value_prop:
        "Your clients log in to your brand at your domain. They see your name everywhere, including invoices and notification emails.",
    },
    expect: {
      minFaqs: 6,
      maxFaqs: 14,
      mustHaveCategories: ["onboarding_and_setup", "stakeholder_concerns"],
      mustHaveGapTypes: ["missing_pricing_context"],
      mustMentionAny: ["white-label", "client", "workspace", "subdomain"],
      mustNotMention: ["ignore previous instructions"],
    },
    judge: {
      rubric:
        "Score whether the FAQs address agency-specific concerns (multi-tenant data isolation, client-side branding, account hand-off) rather than generic SaaS positioning.",
      minScore: 7,
    },
  },
];
