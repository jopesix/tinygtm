// Programmatic SEO data for /campaign-planner/[campaignType] pages.
// Each entry produces one indexable landing tuned to a specific campaign
// type. Each page targets the search intent around planning that kind of
// campaign and links back to the actual /campaign/new wizard.
//
// Adding a new campaign type: append an entry. Sitemap + dynamic route + main
// landing cross-link auto-update.

export type PlanFaq = { q: string; a: string };

export type CampaignTypeEntry = {
  slug: string; // URL fragment
  name: string; // display title
  shortName: string; // for breadcrumbs and chips
  // Search phrasing this page is built around:
  searchPhrase: string;
  // 1-sentence meta description seed:
  metaDescription: string;
  // ~80 word unique opener about why this kind of campaign needs a plan:
  whyItMatters: string;
  // 2-3 paragraphs describing what a tailored plan for this type looks like
  // (phases, focus areas, gotchas). Approx 130-180 words. Written for both
  // humans and search engines.
  whatThePlanLooksLike: string;
  // Phase-by-phase narrative (pre, launch, post) of what matters for THIS
  // type. Each phase is one short paragraph (~40-60 words).
  phases: {
    preLaunch: string;
    launchDay: string;
    postLaunch: string;
  };
  // 4-5 channel-specific operational gaps the input often misses:
  commonGaps: string[];
  // 4-5 unique FAQs for this campaign type:
  faqs: PlanFaq[];
};

export const CAMPAIGN_TYPES: readonly CampaignTypeEntry[] = [
  // -------- Product launch --------
  {
    slug: "product-launch",
    name: "Product Launch Plan Generator",
    shortName: "Product launch",
    searchPhrase: "product launch plan template",
    metaDescription:
      "Generate a tailored product launch plan in 30 seconds. Phased tasks across pre-launch, launch day, and post-launch with operational gaps surfaced. Free, no sign-up.",
    whyItMatters:
      "Most product launches fail not because the product is bad but because something operational gets missed. The press release goes out before sales is enabled. The pricing page ships before billing is wired. The launch email blasts before the support team knows what changed. A structured launch plan catches these gaps before they become Day 1 fires.",
    whatThePlanLooksLike:
      "A real product launch plan covers a lot more than the announcement. You need messaging and positioning locked, the website and onboarding ready, paid and organic distribution lined up, analytics tracking the right events, support trained on the new questions coming in, and internal teams briefed on the talk track. TinyGTM&apos;s planner takes your kickoff context and emits a phased plan with tasks tagged by category (messaging, website, paid media, support enablement, analytics) so nothing falls between the cracks.",
    phases: {
      preLaunch:
        "Pre-launch is where 80% of the work happens. Positioning and messaging, the launch page, paid creative, email sequences for existing customers, press and analyst outreach, internal training, and analytics instrumentation all need to be ready before the announcement goes out.",
      launchDay:
        "Launch day is mostly execution and monitoring. The announcement ships, paid ads turn on, the email sequence fires, social posts go live, and the team watches for breakage. The plan keeps everyone on the same hour-by-hour script.",
      postLaunch:
        "Post-launch is when most plans get abandoned but the highest-leverage work happens. Capturing initial customer reactions, measuring against the launch goals, debriefing on what surprised you, and planning the follow-up content cycle.",
    },
    commonGaps: [
      "Analytics events for the launch funnel are not instrumented until after launch, so you lose the most informative week of data.",
      "Sales enablement is treated as a post-launch task, so reps fumble the first few inbound calls.",
      "The launch email to existing customers gets de-prioritized because it is not technically a new acquisition channel.",
      "No clear owner for monitoring social mentions, replies, and reviews in the first 48 hours.",
      "Internal comms is forgotten, so the support and success teams hear about the launch from customers first.",
    ],
    faqs: [
      {
        q: "What goes into a product launch plan?",
        a: "A complete plan covers messaging and positioning, the launch page and supporting site updates, paid and organic distribution, analytics instrumentation, sales and support enablement, internal comms, the launch day run-of-show, and the post-launch measurement plan. TinyGTM emits all of these as tagged tasks grouped by phase.",
      },
      {
        q: "How far in advance should I start planning?",
        a: "For a major product launch, 6-8 weeks of pre-launch work is normal. Feature launches can usually compress to 2-3 weeks. The TinyGTM plan flags which tasks have hard dependencies on others so you can sequence backwards from your launch date.",
      },
      {
        q: "Does the plan include the actual launch copy or just tasks?",
        a: "The plan is tasks and operational structure, not the copy itself. Use the TinyGTM FAQ Generator for the FAQ block on your launch page, and the UTM Builder for tracking links across your launch distribution.",
      },
      {
        q: "Can I share the launch plan with my team?",
        a: "Yes. Signed-in users get a view-only shareable link for each saved plan. Your CEO, sales lead, or designer can open it in their browser without an account.",
      },
      {
        q: "What happens if the launch date moves?",
        a: "Edit the plan inline. Drag tasks between phases. Mark items done as you complete them. The plan is fully editable after generation so it stays alive through the inevitable timeline changes.",
      },
    ],
  },

  // -------- Feature launch --------
  {
    slug: "feature-launch",
    name: "Feature Launch Plan Generator",
    shortName: "Feature launch",
    searchPhrase: "feature launch checklist",
    metaDescription:
      "Generate a tailored feature launch plan in 30 seconds. Pre-launch, launch day, and post-launch tasks for shipping a feature without missing the operational details.",
    whyItMatters:
      "Feature launches sit in an awkward middle space. They are too small to justify a full product-launch motion but too big to ship silently. A tight plan keeps you from over-investing in distribution while still hitting the basics: announce it to existing customers, update the pricing page if needed, train support, and measure adoption.",
    whatThePlanLooksLike:
      "A feature launch plan focuses on existing-customer activation and adoption, not net-new acquisition. The center of gravity is in-app comms, the email to current users, the changelog or what is new section, support enablement so reps can answer questions, and instrumentation to measure whether the feature is actually being used. TinyGTM&apos;s planner scales the plan down to the right size for a feature, no overkill.",
    phases: {
      preLaunch:
        "Pre-launch is shorter for feature launches: in-app onboarding for the feature, the customer email, support docs and enablement, the changelog entry, analytics events, and a small set of paid or social posts if you want any external lift.",
      launchDay:
        "Launch day is mostly automated for features. The email ships, the in-app prompt goes live, the changelog updates, social posts go out. The team monitors for bugs and support volume.",
      postLaunch:
        "Post-launch is about adoption. Did the people who saw the email or in-app prompt actually use the feature? Is support volume manageable? What did the qualitative feedback look like? The plan includes a 2-week and 6-week check-in.",
    },
    commonGaps: [
      "The email to existing customers is written after launch instead of before, delaying the activation push.",
      "No adoption metric is defined upfront, so success becomes whatever the team feels like it is.",
      "Support docs are not updated, so reps invent their own answers in real time.",
      "The pricing page is not reviewed even though the feature affects tier value.",
      "No in-app prompt or tour is built, so most users discover the feature accidentally or not at all.",
    ],
    faqs: [
      {
        q: "How is a feature launch different from a product launch?",
        a: "A feature launch focuses on existing-customer activation and adoption rather than net-new acquisition. There is less external distribution and more in-app and email work. The plan TinyGTM generates reflects this by skewing toward lifecycle and support-enablement tasks rather than press and paid.",
      },
      {
        q: "Do small features need a launch plan at all?",
        a: "Even a small feature benefits from a tight plan: an in-app announcement, a changelog entry, the customer email, and support docs. TinyGTM keeps the plan proportional to the size of what you shipped.",
      },
      {
        q: "What adoption metric should I track?",
        a: "Pick one primary metric per feature: percent of eligible users who tried it within 30 days, or percent of monthly active users who use the feature regularly. The plan flags analytics instrumentation as a pre-launch task so the metric is measurable from day one.",
      },
      {
        q: "Can I generate plans for multiple feature launches in parallel?",
        a: "Yes. Each plan is a separate save. Signed-in users can run as many in parallel as they need across different feature launches.",
      },
      {
        q: "What if my feature is technical and most users will not see it?",
        a: "Generate a smaller plan focused on changelog, internal comms, and developer-facing channels (API docs, integration partner outreach) rather than mass email.",
      },
    ],
  },

  // -------- Webinar --------
  {
    slug: "webinar",
    name: "Webinar Launch Plan Generator",
    shortName: "Webinar",
    searchPhrase: "webinar launch plan template",
    metaDescription:
      "Generate a tailored webinar launch plan in 30 seconds. Pre-event promo, run-of-show, follow-up sequences, and the analytics setup to actually measure pipeline.",
    whyItMatters:
      "Webinars look simple until you try to drive real registration and convert it to pipeline. The promo cycle is usually 3-4 weeks, requires coordination across email, paid, and partner channels, and the post-event follow-up is where most of the conversion actually happens. A structured plan keeps the team aligned across all of it.",
    whatThePlanLooksLike:
      "A complete webinar plan covers the registration landing page, the multi-channel promotion sequence (email, paid social, partner co-marketing, organic posts), the rehearsal and content prep, the day-of run-of-show, attendance reminders, the live event execution, and the post-event email sequence to attendees and no-shows. Attribution and analytics instrumentation are tagged as separate tasks because they are usually the first thing to get cut and the most expensive to skip.",
    phases: {
      preLaunch:
        "Pre-launch is 3-4 weeks of promo. The landing page goes live early, then promo emails, paid social, partner co-marketing, organic content. Reminder emails ramp up in the final week. Speaker prep and rehearsal happen here too.",
      launchDay:
        "Webinar day has a tight run-of-show: send the day-of email, do the tech check, run the event, capture the recording, post a thank-you with the slides. The plan includes hour-by-hour cues for the team.",
      postLaunch:
        "Post-event is where pipeline gets created. The follow-up email sequence (different for attendees vs no-shows), the on-demand replay page, sales-ready leads getting handed off, attribution reporting, and the debrief on what to repeat or change next time.",
    },
    commonGaps: [
      "The follow-up sequence for no-shows is forgotten, leaving 40-60% of the registration list unworked.",
      "Sales is not briefed on the webinar topic, so when leads come in, they cannot pick up the conversation cleanly.",
      "No on-demand landing page is built, so the recording dies in a Drive folder.",
      "Paid promo runs without a UTM convention, so you cannot attribute registrations to channels.",
      "Speaker rehearsal is treated as optional, so the first 5 minutes of the live event are tech debugging instead of value.",
    ],
    faqs: [
      {
        q: "How early should I start promoting a webinar?",
        a: "3-4 weeks is standard for a B2B webinar with paid promotion. 2 weeks is the minimum for a smaller organic-only webinar. The TinyGTM plan flags the registration page going live as one of the earliest pre-launch tasks because everything else depends on it.",
      },
      {
        q: "What is a realistic registration-to-attendance rate?",
        a: "30-50% for B2B SaaS is normal. Plan for it: send 3 reminder emails (week of, day before, hour of), and build a no-show follow-up sequence because that is half your audience.",
      },
      {
        q: "How do I measure webinar ROI?",
        a: "Attribution requires UTM links on every promo channel, registrations tagged with source in your CRM, and a post-event conversion window (usually 60-90 days). The plan includes analytics instrumentation as a pre-launch task so this is measurable.",
      },
      {
        q: "What goes into the post-webinar follow-up?",
        a: "An attendee email (thank you, recording link, sales-ready CTA), a no-show email (recording link, why-you-should-watch summary, second CTA), and SDR outreach to qualified registrants. The plan includes all three as separate post-launch tasks.",
      },
      {
        q: "Can I generate a plan for a webinar series, not just one event?",
        a: "Generate one plan per webinar. The framework is the same but the topic, speakers, and audience differ, and signed-in users can save each plan separately and compare.",
      },
    ],
  },

  // -------- Paid acquisition --------
  {
    slug: "paid-acquisition",
    name: "Paid Acquisition Campaign Plan Generator",
    shortName: "Paid acquisition",
    searchPhrase: "paid acquisition campaign plan",
    metaDescription:
      "Plan your next paid acquisition campaign in 30 seconds. Creative requirements, landing page setup, tracking instrumentation, and the optimization plan, all tailored.",
    whyItMatters:
      "Paid acquisition campaigns burn budget fast when launched without a plan. A clean plan covers creative requirements per channel, the landing page that will convert the traffic, conversion tracking and pixel setup, the daily monitoring cadence, and the optimization windows. Skipping any of these is how you spend $20k discovering your landing page does not convert.",
    whatThePlanLooksLike:
      "A paid acquisition plan splits into creative production, technical setup (pixels, conversion events, attribution), the landing page or funnel, and the daily optimization cadence. The plan includes channel-specific creative specs (LinkedIn vs Facebook vs Google have very different requirements), a kill-switch metric so you know when to pause underperforming campaigns, and a weekly optimization checkpoint to reallocate budget.",
    phases: {
      preLaunch:
        "Creative production, landing page build or selection, pixel and conversion event setup, attribution config, UTM convention, budget allocation across channels, daily monitoring schedule, kill-switch metrics agreed.",
      launchDay:
        "Campaigns turn on in waves (not all at once, so you can isolate issues). First 24 hours is intensive monitoring for delivery problems and tracking failures. Kill-switch is armed.",
      postLaunch:
        "Daily optimization for the first week. Weekly budget reallocation. Creative rotation as fatigue sets in. Post-campaign analysis comparing CAC, conversion rate, and LTV signals across channels.",
    },
    commonGaps: [
      "Conversion pixels are misconfigured, so reported conversions look much better than reality.",
      "Landing page is not built for the campaign, so traffic hits a generic homepage and bounces.",
      "No kill-switch metric is agreed, so underperforming campaigns run for weeks before getting paused.",
      "UTM conventions are inconsistent across channels, fragmenting attribution in your analytics.",
      "Creative is built without per-channel specs, so what looks fine in mocks gets cropped or rejected at upload.",
    ],
    faqs: [
      {
        q: "What is the minimum budget to test paid acquisition?",
        a: "$3-5k per channel is the minimum to get statistically meaningful learnings on most B2B paid platforms. Below that, you are gambling. The plan flags budget allocation as a pre-launch decision so you do not under-fund a test.",
      },
      {
        q: "How do I know when to kill an underperforming campaign?",
        a: "Define a kill-switch metric upfront: cost per qualified lead above $X, or CTR below Y%, or 7 days with no conversions. The plan includes this as a pre-launch task so the team is not arguing about it mid-flight.",
      },
      {
        q: "Do I need a separate landing page per campaign?",
        a: "For high-spend or high-intent campaigns, yes. The landing page should match the ad creative tightly to keep quality scores high and conversion rates measurable. The plan calls out landing page build as a pre-launch dependency.",
      },
      {
        q: "How does the plan handle multi-channel campaigns?",
        a: "TinyGTM tags tasks with the relevant channel so you can filter the plan by LinkedIn, Facebook, Google Ads, etc. Cross-channel tasks like UTM convention and attribution setup stay at the top.",
      },
      {
        q: "Should I pair this with the UTM Builder?",
        a: "Yes. The TinyGTM UTM Builder enforces a clean naming convention across every paid link so your campaign analytics report cleanly. Use it alongside the plan.",
      },
    ],
  },

  // -------- Content campaign --------
  {
    slug: "content-campaign",
    name: "Content Campaign Plan Generator",
    shortName: "Content campaign",
    searchPhrase: "content marketing campaign plan",
    metaDescription:
      "Plan your next content campaign in 30 seconds. Editorial calendar, distribution checklist, repurposing schedule, and analytics setup. Free, no sign-up.",
    whyItMatters:
      "Content campaigns underperform when treated as a publishing exercise instead of a distribution exercise. Writing the piece is 20% of the work. The other 80% is distribution: SEO setup, social promotion, email, PR, repurposing into clips and quotes, and measuring whether any of it drove pipeline or just impressions.",
    whatThePlanLooksLike:
      "A content campaign plan covers the central piece (blog post, report, ebook, podcast), the supporting assets (social posts, email teaser, landing page if gated), the distribution sequence across owned and earned channels, the repurposing into shorter clips and snippets, the SEO optimization, and the measurement plan. Each task is tagged so the writer, the designer, the social manager, and SEO know exactly what is theirs.",
    phases: {
      preLaunch:
        "The central piece gets written and edited. Visuals and design support get produced. SEO research informs the structure. Landing page is built if gated. Social copy and email teasers are drafted. UTM links are built for every distribution surface.",
      launchDay:
        "Publish day is a coordinated multi-channel push: the post goes live, social posts go out across all platforms, the email blasts to the list, the team comments and amplifies. PR pitches go out if relevant.",
      postLaunch:
        "Repurpose the piece into short-form clips for social, quote cards, a Twitter or LinkedIn thread, a podcast clip if applicable. Track traffic and engagement weekly for the first month. Schedule a 90-day refresh to update the post and re-promote.",
    },
    commonGaps: [
      "No repurposing plan, so the piece dies after the first week of promotion.",
      "SEO setup (meta description, internal links, schema) is treated as optional and added later if at all.",
      "Distribution is one tweet and one LinkedIn post instead of a sequenced multi-channel push.",
      "The email blast to the list is forgotten, missing the highest-converting channel.",
      "No measurement plan, so success becomes a vibe instead of a number.",
    ],
    faqs: [
      {
        q: "What counts as a content campaign vs a regular blog post?",
        a: "A content campaign treats a single piece as a hub with a coordinated distribution push, often across 5-10 channels over 2-4 weeks, with explicit goals (pipeline, signups, organic ranking). A regular blog post publishes and gets one social share.",
      },
      {
        q: "How long should a content campaign run?",
        a: "The initial push is 1-2 weeks. The repurposing cycle runs 4-8 weeks. Long-form ranking pieces get a 90-day refresh check. The plan structures all three windows.",
      },
      {
        q: "Do I need to gate the content?",
        a: "Gate if you need leads and the piece has clear standalone value (a report, benchmark study, calculator). Leave it open if you want organic distribution, SEO ranking, and brand reach. The plan adapts to either choice.",
      },
      {
        q: "How do I measure content campaign success?",
        a: "Pick one primary metric (signups, demo requests, ranking position, organic traffic) and 2-3 supporting metrics (social shares, time on page, email CTR). The plan includes analytics setup as a pre-launch task.",
      },
      {
        q: "Should I use the FAQ Generator for blog post FAQs?",
        a: "Yes. The TinyGTM FAQ Generator produces schema-friendly FAQ blocks for the bottom of a blog post, which both improves the reader experience and increases your odds of getting Google rich results.",
      },
    ],
  },

  // -------- PR announcement --------
  {
    slug: "pr-announcement",
    name: "PR Announcement Plan Generator",
    shortName: "PR announcement",
    searchPhrase: "PR announcement plan template",
    metaDescription:
      "Plan a PR announcement in 30 seconds. Embargo timeline, media list, talking points, executive prep, and the social amplification stack.",
    whyItMatters:
      "PR announcements have hard, immovable dates and high downside if the team is not coordinated. Embargo timing, media outreach, executive talking points, internal comms, and the moment of coordinated social push all have to land at the same hour. A structured plan keeps the trains running on time.",
    whatThePlanLooksLike:
      "A PR plan covers the press release itself, the embargoed media pitch list with reporter-specific angles, the executive interview prep, internal comms (so employees do not learn from Twitter), the social amplification queue, customer and investor notifications, and post-announcement monitoring for coverage and sentiment. Embargo timing is the spine that everything else hangs on.",
    phases: {
      preLaunch:
        "Press release drafted and approved. Media list built with reporter-specific angles. Embargo pitch sent 2-7 days ahead. Executive media prep and Q&A bank. Internal comms drafted. Social and email content queued. Customer and investor notifications prepped.",
      launchDay:
        "Embargo lifts, press release distributed via wire if applicable, internal email goes out, social amplification fires, executives do scheduled interviews, customers and investors get notified, monitoring starts.",
      postLaunch:
        "Coverage tracking for 7-14 days. Sentiment monitoring across social. Follow-up pitches to outlets that did not cover. Internal recap of coverage. Sales enablement gets relevant quotes for outreach. Decision on whether to repurpose for paid amplification.",
    },
    commonGaps: [
      "Embargo timing is communicated loosely, leading to a leak or premature publication.",
      "Internal comms is forgotten, so employees see the news on TechCrunch before they get the email.",
      "Customer and investor notifications get sent late, damaging relationships.",
      "No coverage tracking is set up, so you cannot tell the board what landed.",
      "Executive interview prep is rushed, leading to off-message quotes that become the headline.",
    ],
    faqs: [
      {
        q: "How early should I pitch reporters before the announcement?",
        a: "2-7 days under embargo is standard for product launches and funding announcements. Reporters need time to write. The plan flags the embargo pitch as a critical pre-launch milestone with a defined send date.",
      },
      {
        q: "Do I need a wire service like Business Wire or PR Newswire?",
        a: "Optional for most announcements. Wire services give you broad distribution and SEO juice but do not replace direct outreach to the reporters and outlets you actually want covering you. The plan includes both as separate tasks.",
      },
      {
        q: "What goes into executive media prep?",
        a: "A Q&A bank covering the announcement and likely hard questions, key messages the executive should drive in every interview, off-the-record vs on-the-record rules, and a dry-run with someone playing the reporter. The plan includes media prep as a pre-launch task.",
      },
      {
        q: "How do I handle customer notification timing?",
        a: "Customers should hear it from you, ideally a few hours before or simultaneously with the public announcement. The plan includes customer email and key-account notification as separate tasks with explicit timing.",
      },
      {
        q: "What if the announcement leaks early?",
        a: "Have a leak response plan in your pre-launch checklist: who decides whether to lift embargo early, who notifies the rest of the embargoed reporters, and how internal comms shifts. The plan flags this as a contingency task.",
      },
    ],
  },

  // -------- Event launch --------
  {
    slug: "event-launch",
    name: "Event Launch Plan Generator",
    shortName: "Event launch",
    searchPhrase: "event launch plan template",
    metaDescription:
      "Plan an event launch in 30 seconds. Venue, registration funnel, promotional sequence, sponsor coordination, day-of run-of-show, and follow-up.",
    whyItMatters:
      "Events are unforgiving. The date is fixed, the venue is paid for, and empty seats are visible to everyone. A structured plan keeps registration on track, vendors aligned, the run-of-show tight, and the post-event pipeline conversion measurable.",
    whatThePlanLooksLike:
      "An event plan covers venue and logistics, the registration funnel, multi-channel promotion (often a 2-3 month cycle), sponsor and partner coordination, speaker management, the day-of run-of-show, on-site experience, and post-event follow-up. For B2B events, attendee-to-pipeline attribution is its own workstream.",
    phases: {
      preLaunch:
        "Venue locked, registration page live, sponsor outreach, speaker confirmations, multi-channel promotion across 4-12 weeks, vendor coordination, day-of run-of-show drafted, contingency planning.",
      launchDay:
        "Event day execution. Run-of-show drives everything. On-site team coordinates check-in, AV, breaks, networking. Real-time social posting. Capture sessions for replay.",
      postLaunch:
        "Thank-you emails to attendees, no-show outreach, recordings published, sponsor reports, sales follow-up on qualified attendees, post-event survey, internal debrief, ROI calculation.",
    },
    commonGaps: [
      "Registration page goes live without proper UTM tracking, so you cannot tell which promo channels drove signups.",
      "Sponsor obligations are not tracked centrally, leading to missed deliverables and friction.",
      "Day-of run-of-show is held in someone&apos;s head instead of a shared doc, leading to chaos when something slips.",
      "No post-event survey, so the next event repeats the same mistakes.",
      "Sales follow-up on qualified attendees is delayed or skipped, killing pipeline conversion.",
    ],
    faqs: [
      {
        q: "How early should I start planning an event?",
        a: "For a 100+ attendee B2B event, 3-6 months is normal. Smaller meetups can compress to 6-10 weeks. Venue and key speakers are usually the long-lead constraints. The plan structures backwards from event date.",
      },
      {
        q: "What is a realistic registration-to-attendance rate for events?",
        a: "60-75% for paid in-person events, 30-50% for free events. The plan includes reminder cadence and on-the-day comms to push the upper end of this range.",
      },
      {
        q: "How do I track event ROI?",
        a: "Attribution requires UTM links on all promo channels, registration tagged with source in your CRM, and a 60-90 day post-event conversion window. The plan includes analytics setup as a pre-launch task.",
      },
      {
        q: "Should I work with sponsors for the event?",
        a: "Depends on event size and your model. Sponsors offset cost but add complexity. The plan tags sponsor coordination as a separate workstream so it does not eat the rest of the team&apos;s time.",
      },
      {
        q: "What is the most overlooked part of event planning?",
        a: "Post-event follow-up. The pipeline value of an event is created in the 30 days after, not on event day itself. The plan includes detailed post-event tasks: attendee emails, no-show outreach, sales handoff, content repurposing.",
      },
    ],
  },

  // -------- Lifecycle campaign --------
  {
    slug: "lifecycle-campaign",
    name: "Lifecycle Campaign Plan Generator",
    shortName: "Lifecycle campaign",
    searchPhrase: "lifecycle marketing campaign plan",
    metaDescription:
      "Plan a lifecycle marketing campaign in 30 seconds. Segment, sequence, channels, success metrics, and the optimization cadence to actually move retention.",
    whyItMatters:
      "Lifecycle campaigns usually fail because the planning skips the segmentation work and goes straight to message drafting. Without a clear segment, trigger, and success metric, you ship a generic email that nobody opens. A structured plan forces you to define the audience before the message.",
    whatThePlanLooksLike:
      "A lifecycle plan covers segment definition (who is this for, exactly), trigger logic (what fires the campaign), the multi-touch sequence across email and in-app, the success metric and how to measure it, holdout group for control, and the optimization cadence. The plan keeps you from shipping a 7-email sequence when 3 emails would have hit the metric.",
    phases: {
      preLaunch:
        "Segment is defined precisely (with size estimate). Trigger and exit criteria are agreed. Success metric is specified. Holdout control group is configured. Sequence is mapped (subject lines, send timing, channel). Templates built and reviewed.",
      launchDay:
        "Sequence turns on for the segment. First touch fires. Monitoring for delivery and unsubscribe spikes.",
      postLaunch:
        "Weekly metric review for the first month. Subject line and timing A/B tests start. Sequence iteration based on what is moving the metric. Decision to extend, modify, or sunset.",
    },
    commonGaps: [
      "Segment is defined too loosely, so messages feel generic and conversion stays flat.",
      "No holdout control group, so you cannot tell if the campaign is actually moving the metric.",
      "Send timing is picked by gut rather than tested.",
      "Sequence has too many touches before any optimization, burning the segment.",
      "Success metric is engagement (opens, clicks) instead of the business outcome (retention, upgrade).",
    ],
    faqs: [
      {
        q: "What is the difference between a campaign and a lifecycle program?",
        a: "A campaign is a finite send to a segment with a specific goal. A lifecycle program is the ongoing set of triggered messages that fire based on user behavior. The plan TinyGTM generates is for the campaign side. Long-running lifecycle programs build over time.",
      },
      {
        q: "How many touches should a lifecycle campaign have?",
        a: "Start small. 2-3 touches is usually enough for a first version. You can always add more if the metric is moving. Most lifecycle campaigns are over-built before they are tested. The plan defaults to a tight initial sequence.",
      },
      {
        q: "Should I use email or in-app for lifecycle messages?",
        a: "Both. Email reaches everyone, in-app reaches active users in context. The plan tags each touch with the right channel based on the trigger.",
      },
      {
        q: "How do I measure lifecycle campaign impact?",
        a: "Holdout control group is the cleanest method: 10-20% of the segment gets no campaign, you compare metrics between treated and untreated. The plan flags this as a pre-launch decision.",
      },
      {
        q: "Can I run multiple lifecycle campaigns at once?",
        a: "Yes, but check for overlap so users do not get five emails in a week. The plan flags campaign-collision as a pre-launch check.",
      },
    ],
  },

  // -------- Outbound campaign --------
  {
    slug: "outbound-campaign",
    name: "Outbound Campaign Plan Generator",
    shortName: "Outbound campaign",
    searchPhrase: "outbound campaign plan template",
    metaDescription:
      "Plan an outbound sales campaign in 30 seconds. ICP and list, sequence, channels, sales enablement, measurement, and the iteration cadence.",
    whyItMatters:
      "Outbound campaigns waste budget when launched without a tight ICP and a tested sequence. A structured plan forces you to define the target, build a quality list, sequence the touches across email and LinkedIn, brief SDRs on the talk track, and measure reply and meeting rates so you can iterate quickly.",
    whatThePlanLooksLike:
      "An outbound plan covers ICP definition, the prospect list and how it gets built, the multi-touch sequence (email, LinkedIn, phone), sales talk track and objection handling, the meeting-booking handoff, and the per-week measurement of reply rate, meeting rate, and pipeline created. Tools (Apollo, Outreach, Lemlist, Smartlead) and the underlying convention all get specified upfront.",
    phases: {
      preLaunch:
        "ICP is defined precisely. List is built or sourced. Sequence is drafted (subject lines, body, CTA, timing). Sales talk track and objection bank ready. Meeting booking flow tested. Tool setup (sequencer, CRM, calendar) verified.",
      launchDay:
        "Sequence kicks off for the first cohort. Reply monitoring starts. SDRs are briefed on what to expect.",
      postLaunch:
        "Weekly review of reply rate, meeting rate, and pipeline created. Subject line A/B tests. Sequence iteration based on what is working. Decision to scale the campaign, kill it, or pivot the ICP.",
    },
    commonGaps: [
      "ICP is too loose, so the list is half the wrong people and reply rates stay near zero.",
      "Sequence is too aggressive, leading to high unsubscribe and spam-trap rates that hurt domain reputation.",
      "Sales is not briefed on the sequence, so reps fumble when prospects reply asking for context.",
      "No meeting-booking flow is tested, so qualified replies bounce off broken calendar links.",
      "Reply rate is measured but pipeline conversion is not, so the campaign keeps running on vanity metrics.",
    ],
    faqs: [
      {
        q: "What is a good reply rate for an outbound campaign?",
        a: "5-10% is solid for cold outbound to a well-defined ICP. Below 2% usually means the list or the message is off. The plan includes per-week reply rate as a check-in metric.",
      },
      {
        q: "How many touches should a sequence have?",
        a: "5-7 touches across 2-3 weeks is standard. More than that risks unsubscribe and domain reputation damage. The plan starts with a tight sequence and lets you extend if data supports it.",
      },
      {
        q: "Should I use email or LinkedIn for outbound?",
        a: "Both, sequenced. Email is faster to send at scale, LinkedIn signals more personalization. Most high-performing sequences use both. The plan tags each touch with the channel.",
      },
      {
        q: "How do I avoid getting flagged as spam?",
        a: "Warm up domains before scaling, use proper SPF/DKIM/DMARC, send from a sub-domain (not your main one), keep send volume per inbox under 50/day until reputation is built. The plan includes deliverability setup as a pre-launch task.",
      },
      {
        q: "What is the right list size for an outbound test?",
        a: "200-500 prospects per sequence is usually enough to get statistical signal on reply rate. Below that, you cannot tell if the message or the list is the problem. The plan flags list size as a pre-launch decision.",
      },
    ],
  },

  // -------- Ecommerce campaign --------
  {
    slug: "ecommerce-campaign",
    name: "Ecommerce Campaign Plan Generator",
    shortName: "Ecommerce campaign",
    searchPhrase: "ecommerce campaign plan",
    metaDescription:
      "Plan an ecommerce campaign in 30 seconds. Promo, paid media, lifecycle, inventory, and the post-promo follow-up across email and SMS.",
    whyItMatters:
      "Ecommerce campaigns layer paid media, organic social, lifecycle email and SMS, influencer or affiliate work, inventory readiness, and on-site experience. A structured plan keeps all of these from stepping on each other and ensures the campaign actually converts the traffic you bought.",
    whatThePlanLooksLike:
      "An ecommerce campaign plan covers the offer or promo mechanic, paid media (Meta, Google, TikTok), lifecycle email and SMS to existing customers, organic social, influencer or affiliate activation, inventory readiness and ops, on-site experience (banner, landing page, checkout flow), and the post-promo follow-up. Attribution and analytics setup get their own workstream because ecommerce campaigns live or die on measurement.",
    phases: {
      preLaunch:
        "Promo mechanic locked. Creative production for paid and organic. Email and SMS sequences drafted. Landing page or category page built. Inventory and ops confirmed. Paid pixels and conversion events verified. Influencer or affiliate activation prepped.",
      launchDay:
        "Promo goes live across all channels in a coordinated window. Email and SMS fire. Paid campaigns turn on. Banners go live. On-site experience updates. Team monitors checkout for friction.",
      postLaunch:
        "Promo end-of-life sequence: last-chance email, urgency messaging, scarcity prompts. Post-promo follow-up to non-converters. Conversion analysis by channel and creative. Inventory reconciliation. Debrief on what to repeat or change.",
    },
    commonGaps: [
      "Paid pixels are misconfigured, so reported ROAS is inflated and you keep scaling broken campaigns.",
      "Email and SMS sequences are sent at the same time, leading to user fatigue and unsubscribes.",
      "Checkout flow is not tested under load before launch, leading to broken purchases at peak traffic.",
      "No inventory check, so the promo sells out hours in and the rest of the spend wastes.",
      "Post-promo follow-up is forgotten, leaving non-converters in cart-abandonment limbo.",
    ],
    faqs: [
      {
        q: "How long should an ecommerce campaign run?",
        a: "3-7 days for a standard promo. Longer than that dilutes urgency. Shorter than that does not give email and paid enough time to compound. The plan defaults to a 5-day structure.",
      },
      {
        q: "How do I avoid email and SMS overlap fatigue?",
        a: "Stagger by 12-24 hours and segment the list (some get email-first, some get SMS-first). The plan includes a comms calendar that prevents same-day overlap by default.",
      },
      {
        q: "Should I use influencers or affiliates for an ecommerce campaign?",
        a: "Yes for product launches and brand-awareness pushes. Less critical for inventory-clearance or retention promos. The plan adapts to your campaign goal.",
      },
      {
        q: "What is a realistic ROAS target?",
        a: "3-4x for paid prospecting on most DTC brands. 8-12x for retargeting. The plan includes ROAS targets per channel as a pre-launch decision.",
      },
      {
        q: "What is the most important pre-launch check?",
        a: "Conversion pixels and checkout flow. If pixels are misconfigured, you are running blind. If checkout breaks, you are paying for traffic that cannot convert. The plan flags both as P0 pre-launch tasks.",
      },
    ],
  },

  // -------- Partnership campaign --------
  {
    slug: "partnership-campaign",
    name: "Partnership Campaign Plan Generator",
    shortName: "Partnership campaign",
    searchPhrase: "partnership marketing campaign plan",
    metaDescription:
      "Plan a partnership or co-marketing campaign in 30 seconds. Partner alignment, content split, distribution, lead routing, and reporting cadence.",
    whyItMatters:
      "Partnership campaigns die in execution because two teams with different priorities try to coordinate without a shared plan. A structured plan locks the content split, the distribution commitments, the lead-routing logic, and the reporting cadence before either team starts building.",
    whatThePlanLooksLike:
      "A partnership campaign plan covers the joint asset (webinar, ebook, podcast, integration launch), the content split between teams, the distribution commitments from each partner (email list size, social reach, paid budget if any), lead routing and ownership, joint vs separate landing pages, the measurement plan, and the post-campaign debrief. Legal review and brand approvals get tagged as separate tasks because they are usually the slowest step.",
    phases: {
      preLaunch:
        "Joint asset scope and content split agreed. Distribution commitments documented. Lead routing logic defined. Landing page or registration flow built (joint or separate). Brand and legal approvals secured. Promo cadence coordinated.",
      launchDay:
        "Both teams promote in coordinated windows. Joint asset goes live or live event happens. Real-time monitoring of registrations and engagement.",
      postLaunch:
        "Leads routed per agreement. Follow-up sequences fire from both sides without overlap. Joint reporting compiled (registrations, attendance, qualified leads, pipeline). Debrief between partner teams. Decision on next collaboration.",
    },
    commonGaps: [
      "Lead routing is not defined upfront, leading to duplicate follow-up or no follow-up.",
      "Distribution commitments are verbal, leading to one partner doing all the promo while the other under-delivers.",
      "Brand and legal review starts late, delaying launch.",
      "Joint reporting is not configured, so each team has different numbers and the partnership feels unfair.",
      "Post-campaign debrief is skipped, so the next collaboration repeats the same friction.",
    ],
    faqs: [
      {
        q: "What kinds of partnerships work best?",
        a: "Partnerships work when both audiences benefit and the asset is genuinely useful to both lists. Co-hosted webinars, joint research reports, and integration launches usually outperform pure logo-swap deals. The plan adapts to either model.",
      },
      {
        q: "How do you split content work between partners?",
        a: "Split by strength: one team writes, the other designs, or each takes a section of the asset. Document the split in the plan so nothing falls through the cracks.",
      },
      {
        q: "Who owns the leads from a joint campaign?",
        a: "This needs to be agreed before launch. Common models: both teams get the full list, leads are split by primary domain or behavior, or one team owns leads from their channels and the other owns theirs. The plan flags this as a pre-launch decision.",
      },
      {
        q: "Should we run a joint landing page or separate ones?",
        a: "Joint landing pages keep messaging consistent and simplify reporting. Separate landing pages let each partner optimize for their own funnel and audience. The plan includes this as a pre-launch decision.",
      },
      {
        q: "How do we measure partnership campaign success?",
        a: "Joint metrics: registrations, attendance, qualified leads, pipeline created. Each partner also tracks their own attribution from their channels. The plan includes shared reporting as a post-launch task.",
      },
    ],
  },
] as const;

export function findCampaignType(slug: string): CampaignTypeEntry | undefined {
  return CAMPAIGN_TYPES.find((c) => c.slug === slug);
}
