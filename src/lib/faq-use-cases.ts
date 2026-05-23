// Programmatic SEO data for /faq-generator/[useCase] pages.
// Each entry produces one indexable landing tuned to a specific FAQ writing
// use case, with unique copy and example questions for that context.
//
// Adding a use case: append an entry. Sitemap + dynamic route + main landing
// cross-link auto-update.

export type UseCaseFaq = { q: string; a: string };

export type FaqUseCase = {
  slug: string; // URL fragment
  name: string; // display name
  shortName: string; // for breadcrumbs and chips
  // Search phrasing this page is built around:
  searchPhrase: string;
  // 1-sentence meta description seed:
  metaDescription: string;
  // ~80 word unique opener about why FAQs matter for THIS use case:
  whyItMatters: string;
  // 2-3 paragraphs describing what good FAQs look like for this use case.
  // Approx 130-180 words.
  whatGoodFaqsLookLike: string;
  // 4-5 example FAQ questions (just questions, not answers) someone in this
  // use case would want to address. Real, specific, useful.
  exampleQuestions: string[];
  // What input/source material works best for this use case:
  sourceMaterialAdvice: string;
  // 4-5 unique FAQs about using the FAQ Generator for this specific case:
  faqs: UseCaseFaq[];
};

export const FAQ_USE_CASES: readonly FaqUseCase[] = [
  // -------- SaaS --------
  {
    slug: "saas",
    name: "FAQ Generator for SaaS",
    shortName: "SaaS",
    searchPhrase: "FAQ generator for SaaS",
    metaDescription:
      "Generate realistic customer FAQs for your SaaS product from PRDs, help docs, and call notes. Grouped by persona, grounded in source material, schema-ready.",
    whyItMatters:
      "SaaS customers ask different questions than ecommerce customers or app users. They want to know about pricing tiers, data security, integrations, onboarding time, the product roadmap, what happens if they churn, and whether the tool fits their team size. Generic FAQ templates miss the SaaS-specific concerns that actually move buying decisions.",
    whatGoodFaqsLookLike:
      "Good SaaS FAQs answer the buying-committee questions, not just the end-user questions. The technical buyer wants security and integration depth. The economic buyer wants pricing transparency and ROI. The end user wants onboarding time and learning curve. The TinyGTM FAQ Generator clusters FAQs by persona so each buying-committee role sees the answers most relevant to them, grounded in your PRDs, sales call transcripts, and product docs.",
    exampleQuestions: [
      "What does pricing look like for a team of 25?",
      "How does your product handle SSO and SCIM provisioning?",
      "What integrations do you support out of the box?",
      "How long does typical onboarding take?",
      "What is your data retention policy if we cancel?",
    ],
    sourceMaterialAdvice:
      "Paste your PRD, your pricing page copy, your security overview if you have one, and 1-2 sales call transcripts. The transcripts are the highest-leverage input because they contain actual customer language.",
    faqs: [
      {
        q: "What sources work best for generating SaaS FAQs?",
        a: "Sales call transcripts, support ticket exports, your PRD or product spec, your pricing page, and any security or compliance overview docs. Transcripts and tickets are the most valuable because they contain real customer language and real questions.",
      },
      {
        q: "Should I group FAQs by persona or by topic?",
        a: "Both. TinyGTM groups by persona automatically (technical buyer, economic buyer, end user) and lets you reorder within each group. Persona-first grouping converts better on pricing and product pages because each persona scans for their own concerns.",
      },
      {
        q: "Can I generate FAQs for a freemium SaaS?",
        a: "Yes. Include the pricing model in your input (freemium with $X/seat/mo paid tier, or free trial then paid) and the FAQs will address upgrade triggers, what's included in free vs paid, and conversion-relevant questions.",
      },
      {
        q: "How do these FAQs compare to ChatGPT-written FAQs?",
        a: "TinyGTM grounds every answer in YOUR source material. A generic ChatGPT prompt produces generic SaaS FAQs that could apply to any company. TinyGTM produces FAQs about YOUR product, with answers that match what your sales team actually says.",
      },
      {
        q: "Can I use these FAQs on my pricing page?",
        a: "Yes. Markdown export produces schema-friendly FAQ blocks that drop directly into a pricing page. The FAQPage schema markup boosts your chances of getting rich results in Google.",
      },
    ],
  },

  // -------- Ecommerce --------
  {
    slug: "ecommerce",
    name: "FAQ Generator for Ecommerce",
    shortName: "Ecommerce",
    searchPhrase: "FAQ generator for ecommerce",
    metaDescription:
      "Generate ecommerce FAQs from product specs, sizing charts, return policies, and customer reviews. Reduce support tickets and lift conversion with grounded answers.",
    whyItMatters:
      "Ecommerce FAQs do two jobs at once: convert browsers into buyers and reduce support volume. Shipping windows, return policies, sizing, materials, care instructions, and warranty terms are the questions that block a purchase. A clean FAQ block on a product page lifts conversion by giving buyers the answers they need without leaving the page.",
    whatGoodFaqsLookLike:
      "Good ecommerce FAQs read like the questions you would actually get in a chat window. They cover shipping (when, how much, where), returns (window, free or paid, condition), sizing or fit (charts, comparisons), product details (materials, dimensions, care), and trust signals (warranty, authenticity, customer service hours). TinyGTM grounds these in your real product specs and policies so the answers match what your support team would say.",
    exampleQuestions: [
      "How long does shipping take to my country?",
      "What is your return policy if it does not fit?",
      "Is this product machine washable?",
      "What sizes are available and how do they compare to other brands?",
      "Do you offer a warranty?",
    ],
    sourceMaterialAdvice:
      "Paste your product description, sizing chart, return policy, shipping policy, materials and care guide, and any chat transcripts or top customer reviews mentioning concerns. Reviews are gold because they tell you which questions actually came up.",
    faqs: [
      {
        q: "Where do ecommerce FAQs work best?",
        a: "Product pages (above the add-to-cart fold), category landing pages, the cart and checkout, and a dedicated help center. Product-page FAQs convert the highest because they answer the specific blocker right where it appears.",
      },
      {
        q: "Should each product have its own FAQ block?",
        a: "Yes. Product-specific FAQs convert significantly better than a generic site-wide block. TinyGTM lets you generate fresh FAQs per product line by changing the input.",
      },
      {
        q: "How do FAQs reduce support volume?",
        a: "Most ecommerce support tickets are repeat questions about shipping, returns, and sizing. A visible FAQ block on the product page deflects 20-40% of these before they become tickets.",
      },
      {
        q: "Can I use customer reviews as input?",
        a: "Yes, and you should. Paste 10-20 of your top reviews. Reviews surface the questions and concerns that actually came up. The generated FAQs will address those head-on.",
      },
      {
        q: "Do these FAQs help with SEO?",
        a: "Yes. The Markdown export produces FAQPage schema markup. Google can surface your FAQs as rich results on the search page itself, giving you more SERP real estate.",
      },
    ],
  },

  // -------- Landing page --------
  {
    slug: "landing-page",
    name: "FAQ Generator for Landing Pages",
    shortName: "Landing page",
    searchPhrase: "landing page FAQ generator",
    metaDescription:
      "Generate landing-page FAQs that handle the objections blocking conversion. Grounded in your product, structured for visual scanability, and schema-ready.",
    whyItMatters:
      "FAQ sections on landing pages are often an afterthought, which is why most of them underperform. A landing-page FAQ block is not a help center. Its job is to handle the specific objections blocking a conversion: pricing, integration, security, time-to-value, and what happens if I do not love it. Done right, the FAQ block is one of the highest-converting elements on the page.",
    whatGoodFaqsLookLike:
      "Landing page FAQs are short, focused on objections, and ordered by what blocks the most people first. 6-10 questions is the sweet spot. Each answer is 2-4 sentences. The most common patterns: pricing transparency, security and trust, the implementation or onboarding question, the cancellation or guarantee, and one product-specific question about a confusing feature. TinyGTM builds these from your landing copy and call transcripts so they read in your brand voice.",
    exampleQuestions: [
      "Is there a free trial or money-back guarantee?",
      "How long does setup actually take?",
      "Will this work for a team of my size?",
      "What happens to my data if I cancel?",
      "Is there a contract or can I leave anytime?",
    ],
    sourceMaterialAdvice:
      "Paste your landing page copy, your pricing page, any sales call transcripts where prospects pushed back, and your support team's most common pre-purchase questions. The FAQs will mirror the actual objections you hear.",
    faqs: [
      {
        q: "How many FAQs should a landing page have?",
        a: "6-10 is the sweet spot. Fewer than 6 feels incomplete. More than 10 dilutes attention and signals defensiveness. Order by objection severity: the question blocking the most conversions goes first.",
      },
      {
        q: "Where should the FAQ section go on the landing page?",
        a: "Above the final CTA or footer. The FAQ is the last objection-handling step before the user converts or leaves. Burying it too high distracts from the main pitch. Placing it too low misses people who scroll.",
      },
      {
        q: "Should I include negative questions like 'is this for me'?",
        a: "Yes. A 'who this is NOT for' question signals confidence and qualifies the right buyer. Counterintuitively, qualifying-out reduces refund rates and support burden.",
      },
      {
        q: "How do I know which objections to include?",
        a: "Pull from sales call transcripts and chat logs. The questions that came up 3+ times in a month are your real objections. TinyGTM grounds the FAQ in your actual transcripts, not generic SaaS templates.",
      },
      {
        q: "Will FAQ schema markup help my landing page SEO?",
        a: "Yes. FAQPage schema lets Google surface your FAQs directly in search results as rich snippets. The TinyGTM Markdown export includes the schema-ready format.",
      },
    ],
  },

  // -------- Product page --------
  {
    slug: "product-page",
    name: "FAQ Generator for Product Pages",
    shortName: "Product page",
    searchPhrase: "product page FAQ generator",
    metaDescription:
      "Generate FAQs for product pages that answer pre-purchase questions, reduce returns, and lift conversion. Grounded in your product specs and customer reviews.",
    whyItMatters:
      "Product page FAQs do double duty: they help shoppers decide to buy, and they reduce returns by setting accurate expectations. The questions a buyer has on a product page are different from the ones they have on a landing page. They are deeper, more specific, and more about the product itself than the company.",
    whatGoodFaqsLookLike:
      "Product page FAQs are tight, specific to the product, and answer the questions that block purchases at the decision moment. Sizing or fit, materials or specs, compatibility, included accessories, warranty, and product-specific edge cases. Generic FAQs about the company belong elsewhere. TinyGTM uses your product description, reviews, and support tickets as input so the FAQs mirror what real shoppers are asking.",
    exampleQuestions: [
      "Will this fit my [specific use case or device]?",
      "What is the difference between this product and [related product]?",
      "What is included in the box?",
      "Is this compatible with [common related thing]?",
      "What is the warranty and what does it cover?",
    ],
    sourceMaterialAdvice:
      "Paste the product description, full specs, materials/dimensions, top 10-20 customer reviews, and a few support tickets that mention pre-purchase questions. The FAQs will hit the specific concerns real buyers had.",
    faqs: [
      {
        q: "How is a product-page FAQ different from a landing-page FAQ?",
        a: "Product-page FAQs are deeper into specifics: sizing, materials, compatibility, what's included. Landing-page FAQs are higher-level objections: pricing, trust, fit for use case. Both have a place, with different content.",
      },
      {
        q: "How many FAQs per product page?",
        a: "4-8 is the sweet spot for ecommerce. Too few feels incomplete; too many overwhelms. Order by what blocks the most buyers first, usually sizing/fit and shipping/returns.",
      },
      {
        q: "Can I use customer reviews as the FAQ source?",
        a: "Yes, and you should. Paste your top reviews. The questions and concerns mentioned in reviews are the highest-priority FAQs to address proactively.",
      },
      {
        q: "Should FAQs be in an accordion or always-expanded?",
        a: "Accordion for 6+ FAQs to keep the page scannable. Always-expanded for 2-3 critical pre-purchase questions like shipping windows. The TinyGTM Markdown export works for both.",
      },
      {
        q: "Will product-page FAQs help with SEO?",
        a: "Yes. Product-page FAQs can earn rich results in Google search via FAQPage schema. They also lower bounce rate by helping buyers find answers without leaving the page, which Google reads as a positive signal.",
      },
    ],
  },

  // -------- Help center --------
  {
    slug: "help-center",
    name: "FAQ Generator for Help Centers",
    shortName: "Help center",
    searchPhrase: "help center FAQ generator",
    metaDescription:
      "Seed your help center or knowledge base with realistic customer FAQs generated from product docs and support data. Grouped by topic and grounded in your sources.",
    whyItMatters:
      "Most help centers launch with 3 articles and grow slowly because writing them is unrewarding work. A structured starting point matters. Generating 15-30 grounded FAQs from your product docs and support transcripts gets a real help center foundation built in an afternoon instead of a quarter.",
    whatGoodFaqsLookLike:
      "Help center FAQs are organized by topic (account, billing, integrations, troubleshooting) and written for self-service. Each answer is complete enough that the user does not need to also email support. Screenshots and step-by-step instructions go inside individual help articles, while the top-level FAQ list serves as a triage layer. TinyGTM generates the FAQ structure and seeded answers; your team adds the deep articles over time.",
    exampleQuestions: [
      "How do I reset my password?",
      "Where can I update my billing information?",
      "How do I cancel my subscription?",
      "How do I invite a team member?",
      "How do I export my data?",
    ],
    sourceMaterialAdvice:
      "Paste your product docs, your top 50 support tickets from the last 90 days, any internal team wiki content about the product, and your billing or onboarding flows. The tickets are most valuable because they show you which questions actually came up.",
    faqs: [
      {
        q: "How do I prioritize which FAQs to create first?",
        a: "Start with the top 20 questions from your support tickets in the last 90 days. These represent 80% of incoming volume. TinyGTM grounds the FAQs in your ticket exports so the first batch deflects the most common cases.",
      },
      {
        q: "Should help center FAQs be short or detailed?",
        a: "FAQ entries should be 2-4 sentences for quick triage. If a topic needs more detail, link to a dedicated article. The FAQ block is the navigation; deep articles are the destination.",
      },
      {
        q: "How often should I update help center FAQs?",
        a: "Review monthly against the top incoming ticket topics. If a question is generating 5+ tickets per month, it needs to be in the FAQ. The TinyGTM Markdown export makes it easy to regenerate sections without rewriting from scratch.",
      },
      {
        q: "Can I generate FAQs in multiple languages?",
        a: "Generate in English first, then translate. The TinyGTM JSON export makes it easy to pass the question/answer pairs to a translation service or workflow without losing the structure.",
      },
      {
        q: "Should help center FAQs use schema markup?",
        a: "Yes. FAQPage schema helps Google surface your help articles in search results. The TinyGTM Markdown export produces schema-friendly output by default.",
      },
    ],
  },

  // -------- Sales enablement --------
  {
    slug: "sales-enablement",
    name: "FAQ Generator for Sales Enablement",
    shortName: "Sales enablement",
    searchPhrase: "sales enablement FAQ generator",
    metaDescription:
      "Build a sales objection-handling FAQ from call transcripts and PRDs. Help reps answer the hard questions on the spot, grounded in real customer language.",
    whyItMatters:
      "Sales teams lose deals because they fumble unexpected questions. A solid objection-handling FAQ gives reps quick reference answers for the security question, the pricing comparison, the competitor question, the integration concern. Reps can search a structured FAQ in 5 seconds, faster than asking a teammate on Slack and waiting.",
    whatGoodFaqsLookLike:
      "Sales enablement FAQs read differently from customer-facing FAQs. They include the question as the prospect would ask it, a recommended response with key talking points, and (often) what NOT to say. They cover security, pricing, integration, competitor comparisons, contracting, implementation, and the most common technical objections. TinyGTM grounds these in your sales call transcripts so the recommended responses use language that has worked with real prospects.",
    exampleQuestions: [
      "How do you compare to [competitor]?",
      "What is your data security and compliance posture?",
      "What does pricing look like for our size?",
      "What if we already use [overlapping tool]?",
      "How long does implementation take?",
    ],
    sourceMaterialAdvice:
      "Paste 5-10 sales call transcripts (especially ones where the deal closed and ones where it lost), your security overview, pricing details, and any competitor battle cards. Lost-deal transcripts are gold for surfacing the questions reps fumbled.",
    faqs: [
      {
        q: "Are these FAQs customer-facing or internal?",
        a: "Internal. Sales enablement FAQs are a reference for reps, written for fast scanning during a call. They include talking points and recommended language a customer-facing FAQ would not. Mark the export clearly so it does not accidentally end up on your website.",
      },
      {
        q: "Where should sales reps access the FAQ?",
        a: "Wherever your team already lives during calls: Notion, Confluence, a shared Drive folder, or a sales enablement tool like Highspot or Seismic. The TinyGTM Markdown and DOCX exports drop into all of these.",
      },
      {
        q: "How do I keep the FAQ updated as the product changes?",
        a: "Regenerate the relevant sections when you ship a major feature or change pricing. Keep the source material (transcripts, PRDs, pricing page) in one place so regenerating is fast.",
      },
      {
        q: "Can I include competitor comparisons?",
        a: "Yes. Include competitor names and known differentiators in your input. The FAQ Generator will produce responses to common competitor-comparison questions, grounded in what you provided.",
      },
      {
        q: "Should I generate one FAQ per product or one per persona?",
        a: "Both axes work. Most teams start with one comprehensive FAQ and add persona-specific variants (enterprise vs SMB, technical buyer vs economic buyer) as the team scales.",
      },
    ],
  },

  // -------- API docs --------
  {
    slug: "api-docs",
    name: "FAQ Generator for API Documentation",
    shortName: "API docs",
    searchPhrase: "API documentation FAQ generator",
    metaDescription:
      "Generate developer-friendly FAQs for your API docs from spec, integration guides, and common support questions. Reduce integration friction.",
    whyItMatters:
      "Developers integrating your API ask predictable questions: rate limits, authentication, error handling, webhook reliability, idempotency, SDKs, and what to do when something fails. A good FAQ section in the API docs accelerates integration and cuts down on the integration-support volume your devrel team has to handle.",
    whatGoodFaqsLookLike:
      "API doc FAQs are precise and link-heavy. Every answer should reference the relevant endpoint, error code, or section of the docs. Code snippets when appropriate. The topics that always need an FAQ: authentication (OAuth flow, key rotation), rate limits and how to handle them, webhook delivery and retries, idempotency keys, pagination, error response shape, and SDKs vs raw HTTP. TinyGTM grounds these in your OpenAPI spec and existing integration guides.",
    exampleQuestions: [
      "How do I handle rate limit errors?",
      "Are webhooks retried on failure?",
      "How do I make a request idempotent?",
      "What is the difference between auth tokens and API keys?",
      "Which SDK should I use for [language]?",
    ],
    sourceMaterialAdvice:
      "Paste your OpenAPI/Swagger spec, integration guide, common error documentation, webhook setup guide, and any developer-support tickets. Support tickets surface the questions that recur often enough to deserve a top-level FAQ.",
    faqs: [
      {
        q: "What sources work best for API doc FAQs?",
        a: "OpenAPI spec, integration guides, error reference docs, webhook reliability docs, and the developer-support ticket queue. Tickets reveal the integration pain points your docs are currently missing.",
      },
      {
        q: "Should API doc FAQs include code snippets?",
        a: "Yes. Most developer FAQs benefit from a 2-5 line code snippet showing the right way to handle the case. The TinyGTM Markdown export preserves code blocks cleanly.",
      },
      {
        q: "Where in the API docs should the FAQ live?",
        a: "Two good places: a top-level FAQ section in the docs nav, and inline FAQs at the bottom of high-traffic endpoint pages. Top-level catches general questions; inline catches endpoint-specific ones.",
      },
      {
        q: "How do I make sure FAQs stay accurate as the API changes?",
        a: "Version your FAQ source material alongside your API spec. When the spec changes, regenerate the affected FAQ entries. Keep the source files in your docs repo so updates are part of your normal PR review.",
      },
      {
        q: "Can FAQs help with developer SEO?",
        a: "Yes. Developer queries like 'how do I handle rate limits in [API name]' are searchable. FAQPage schema on the docs pages can earn rich results that drive integration traffic directly.",
      },
    ],
  },

  // -------- Customer onboarding --------
  {
    slug: "customer-onboarding",
    name: "FAQ Generator for Customer Onboarding",
    shortName: "Customer onboarding",
    searchPhrase: "customer onboarding FAQ",
    metaDescription:
      "Generate onboarding FAQs that answer the questions new users have in week one. Reduce support tickets, accelerate activation, and improve retention.",
    whyItMatters:
      "Most churn happens in the first 30 days because users fail to activate. An onboarding FAQ surfaces the questions new users actually hit during setup and first use, before those questions become support tickets or silent drop-offs. It is one of the highest-ROI documentation efforts because it directly affects activation rate.",
    whatGoodFaqsLookLike:
      "Onboarding FAQs answer the immediate questions in the first 1-7 days: how do I add my team, how do I connect my data, what is the first thing I should set up, where do I find the [common feature], how do I undo this. They are written for someone who has never used the product before and skims fast. TinyGTM grounds these in your in-app onboarding flow, support ticket data, and product docs.",
    exampleQuestions: [
      "How do I invite my team?",
      "How do I connect [common integration]?",
      "What should I set up first?",
      "Where can I find [common feature]?",
      "How do I undo [common action]?",
    ],
    sourceMaterialAdvice:
      "Paste your in-app onboarding copy, your getting-started guide, your first-week activation email sequence, and the top 30 support tickets from new users (created within 30 days of signup). New-user tickets are the highest-leverage input.",
    faqs: [
      {
        q: "Where should onboarding FAQs live?",
        a: "Three places: the in-app help widget (so the answer is one click away during setup), the getting-started page in your docs, and inside your activation email sequence as embedded links. Multiple surfaces because new users do not know where to look.",
      },
      {
        q: "How is an onboarding FAQ different from a regular help center FAQ?",
        a: "Scope. Onboarding FAQs focus only on the first 30 days. Help center FAQs cover the full product. Onboarding FAQs are simpler in language and assume zero prior knowledge.",
      },
      {
        q: "How often should I update onboarding FAQs?",
        a: "Every time the onboarding flow changes, and every quarter to incorporate new common tickets. New-user behavior shifts quickly. TinyGTM makes regenerating affordable so updates are not a project.",
      },
      {
        q: "Can I tie FAQs to specific in-app moments?",
        a: "Yes. Trigger specific FAQ answers contextually inside your in-app onboarding (when the user hits a known confusing screen). Most product tour tools support this. The JSON export from TinyGTM makes the FAQ machine-readable.",
      },
      {
        q: "How do onboarding FAQs affect activation rate?",
        a: "Well-placed onboarding FAQs typically lift activation rate 5-15% by removing the friction of waiting on support. The lift is highest when FAQs appear in the exact moment of confusion (in-app contextual help).",
      },
    ],
  },

  // -------- App store listing --------
  {
    slug: "app-store",
    name: "FAQ Generator for App Store Listings",
    shortName: "App store",
    searchPhrase: "app store FAQ generator",
    metaDescription:
      "Generate App Store and Google Play FAQs that address user concerns before they hit the install button. Reduce uninstalls and improve store conversion.",
    whyItMatters:
      "App store listings have only a few hundred words to convince someone to install. The FAQ section (where supported) is often the difference between an install and a swipe-away. Storage requirements, in-app purchases, ad presence, data collection, offline functionality, and supported devices are the questions that block installs.",
    whatGoodFaqsLookLike:
      "App store FAQs are extra short, scannable, and focused on install-decision questions: is there a free version, does it work offline, what data does it collect, are there ads, what platforms are supported, is there in-app currency or one-time purchase. The TinyGTM FAQ Generator can produce these from your app description, screenshots metadata, and store policies.",
    exampleQuestions: [
      "Is the app free or paid?",
      "Does it work offline?",
      "What data does the app collect?",
      "Are there ads or in-app purchases?",
      "What devices and OS versions are supported?",
    ],
    sourceMaterialAdvice:
      "Paste your app description, your privacy policy, your in-app purchase summary, your supported-devices list, and any common store reviews that ask repeated questions. Reviews surface the install-blocker concerns.",
    faqs: [
      {
        q: "Do app stores support FAQ sections?",
        a: "Google Play has dedicated FAQ fields. Apple App Store does not have a dedicated FAQ section but you can include FAQ-style content in your description. Both stores benefit from a clean FAQ section on your marketing site that the store listing links to.",
      },
      {
        q: "How short should app store FAQs be?",
        a: "Very short. 1-2 sentence answers. Users scanning a store listing decide in seconds. Long answers belong on your marketing site or help center, not in the store.",
      },
      {
        q: "What questions matter most for store conversion?",
        a: "Free vs paid, in-app purchases, ads, data privacy, offline support, and supported devices. These are the install-blockers. The TinyGTM generator surfaces these from your input.",
      },
      {
        q: "Should I localize the FAQs per region?",
        a: "Yes, for major markets. Generate in English first, then localize. The JSON export from TinyGTM makes batch translation easier than rewriting from scratch.",
      },
      {
        q: "Do app store FAQs help with App Store SEO (ASO)?",
        a: "Yes. Keyword presence in your description and FAQ matters for ASO. Use the natural keywords users search for in their questions. The generator pulls these out from your source material.",
      },
    ],
  },

  // -------- Online course --------
  {
    slug: "online-course",
    name: "FAQ Generator for Online Courses",
    shortName: "Online course",
    searchPhrase: "online course FAQ generator",
    metaDescription:
      "Generate course landing page FAQs that address student concerns before purchase. Cover time commitment, prerequisites, refunds, access, and credentialing.",
    whyItMatters:
      "Course buyers have a specific set of pre-purchase questions: how much time does this take, do I have the prerequisites, what do I actually get, is there a refund, do I get a certificate, is there support if I get stuck. A clean FAQ block on the course landing page addresses these without making the prospect leave to find answers.",
    whatGoodFaqsLookLike:
      "Course FAQs answer time commitment, prerequisites, format (video vs reading vs cohort), access duration, credentialing or certification, community access, refund policy, and the question 'is this for me'. The FAQ block sits near the buy button and handles the last objections. TinyGTM grounds these in your course curriculum, sales page, and any past student feedback.",
    exampleQuestions: [
      "How much time per week does this course require?",
      "What prerequisites do I need?",
      "Do I get a certificate at the end?",
      "What is the refund policy?",
      "How long do I have access to the materials?",
    ],
    sourceMaterialAdvice:
      "Paste your full curriculum, your sales page copy, your refund and access policies, and a few testimonials or completion-rate notes. If you have run the course before, include common pre-purchase questions from your inbox.",
    faqs: [
      {
        q: "How many FAQs should a course landing page have?",
        a: "6-10. Cover the universal questions (time, prereqs, refunds, access, credentials) plus 2-3 specific to your course (cohort vs self-paced, community access, project-based vs theoretical).",
      },
      {
        q: "Should the FAQ be near the top or near the buy button?",
        a: "Near the buy button. The FAQ is the final objection-handling step before purchase. Putting it too early distracts from the main sales narrative.",
      },
      {
        q: "What is the single most important course FAQ?",
        a: "Time commitment. Most course refunds happen because students underestimated the time required. Setting an honest expectation upfront reduces refunds significantly.",
      },
      {
        q: "Should I mention the refund policy in the FAQ?",
        a: "Yes. A clear refund policy in the FAQ increases conversion more than it increases refunds, because it removes risk perception. Be specific about the window and conditions.",
      },
      {
        q: "Can FAQ schema markup help my course rank?",
        a: "Yes. Course landing pages with FAQPage schema can earn rich results for queries like 'how long does [course topic] take' or 'do I need [prereq] for [course]'. The TinyGTM Markdown export includes the schema.",
      },
    ],
  },
] as const;

export function findUseCase(slug: string): FaqUseCase | undefined {
  return FAQ_USE_CASES.find((c) => c.slug === slug);
}
