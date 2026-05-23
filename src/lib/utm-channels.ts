// Programmatic SEO data for /utm-link-builder/for-[channel] pages.
// Each entry produces one indexable landing tuned to a specific marketing
// channel — unique copy, examples, and FAQs so Google sees them as distinct
// useful pages instead of templated duplicates.
//
// Adding a channel: append a new entry. Sitemap + dynamic route auto-pick up.

export type UtmExample = {
  context: string;
  url: string;
};

export type UtmGotcha = string;

export type ChannelFaq = {
  q: string;
  a: string;
};

export type UtmChannel = {
  slug: string; // URL fragment
  name: string; // display name
  shortName: string; // for breadcrumbs
  // Search phrasing this page is built around:
  searchPhrase: string;
  // 1-sentence meta description seed:
  metaDescription: string;
  // ~80 word unique opener about why UTM matters for THIS channel:
  whyItMatters: string;
  // Recommended UTM values:
  recommendedSource: string;
  recommendedMedium: string;
  // Optional: typical campaign-name pattern:
  campaignPattern: string;
  // 3-4 real-world usage examples:
  examples: UtmExample[];
  // 3-5 channel-specific gotchas:
  gotchas: UtmGotcha[];
  // 4-6 channel-specific FAQs:
  faqs: ChannelFaq[];
};

const baseUrl = "https://yoursite.com/landing";

export const UTM_CHANNELS: readonly UtmChannel[] = [
  // -------- LinkedIn --------
  {
    slug: "linkedin",
    name: "LinkedIn",
    shortName: "LinkedIn",
    searchPhrase: "LinkedIn UTM builder",
    metaDescription:
      "Build LinkedIn UTM tracking links that survive LinkedIn's URL handling. Recommended utm_source and utm_medium values, examples for posts, ads, DMs, and Sales Navigator — free UTM builder.",
    whyItMatters:
      "LinkedIn strips tracking parameters from some auto-shared URLs and shortens long URLs in feeds, which means a sloppy UTM strategy on LinkedIn ends up looking like 'direct' traffic in your analytics. Separating organic posts, Sales Navigator outreach, sponsored content, and InMail-shared links is the whole game — without UTMs, you can't tell whether your LinkedIn ad spend is actually working.",
    recommendedSource: "linkedin",
    recommendedMedium: "social",
    campaignPattern: "linkedin-{topic}-{date}",
    examples: [
      {
        context: "Personal LinkedIn post linking to a blog",
        url: `${baseUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=founder-post-2026q2`,
      },
      {
        context: "Company page sponsored content",
        url: `${baseUrl}?utm_source=linkedin&utm_medium=cpc&utm_campaign=demand-gen-2026q2&utm_content=carousel-v1`,
      },
      {
        context: "Sales Navigator InMail",
        url: `${baseUrl}?utm_source=linkedin&utm_medium=outbound&utm_campaign=sdr-q2`,
      },
      {
        context: "LinkedIn newsletter (article)",
        url: `${baseUrl}?utm_source=linkedin&utm_medium=newsletter&utm_campaign=weekly-2026-05`,
      },
    ],
    gotchas: [
      "LinkedIn shortens URLs in feed posts — use a link shortener that preserves your UTM parameters (Dub, Short.io) rather than LinkedIn's auto-shorten.",
      "Don't put a UTM link in your bio without a unique utm_campaign — bio traffic over the year mashes together and becomes useless.",
      "LinkedIn Lite (mobile data-saver mode) sometimes drops URL parameters on click. Test from a fresh device before launching a big campaign.",
      "Set utm_medium=cpc for sponsored content and utm_medium=social for organic — mixing them up makes your paid LinkedIn impact invisible in funnel reports.",
    ],
    faqs: [
      {
        q: "What's the recommended utm_source value for LinkedIn?",
        a: "Use `utm_source=linkedin` (lowercase, single word). Don't use 'LinkedIn', 'Linkedin', or 'linked-in' — Google Analytics treats these as separate sources and fragments your reports.",
      },
      {
        q: "Should utm_medium be 'social' or 'cpc' for LinkedIn?",
        a: "Use `utm_medium=social` for organic posts (personal posts, company page posts, comments) and `utm_medium=cpc` for sponsored content and LinkedIn Ads. For InMail or outbound DMs, `utm_medium=outbound` is cleaner.",
      },
      {
        q: "Does LinkedIn strip UTM parameters?",
        a: "LinkedIn preserves UTM parameters on links shared in posts, messages, and ads. It does shorten long URLs visually in feed previews, but the underlying URL still carries your UTM intact when the user clicks.",
      },
      {
        q: "How do I track LinkedIn bio link traffic?",
        a: "Build a unique UTM for the bio link (utm_source=linkedin, utm_medium=profile, utm_campaign=bio-2026q2). Update the utm_campaign each quarter so you can measure changes in profile-to-site traffic over time.",
      },
      {
        q: "Can I track which LinkedIn post drove a conversion?",
        a: "Yes — set a unique utm_content value per post (utm_content=post-launch-2026-05-19). The combination of utm_campaign + utm_content gives you per-post attribution in any analytics tool that respects UTM.",
      },
    ],
  },

  // -------- Facebook --------
  {
    slug: "facebook",
    name: "Facebook",
    shortName: "Facebook",
    searchPhrase: "Facebook UTM builder",
    metaDescription:
      "Build Facebook UTM tracking links for posts, groups, ads, and Messenger. Recommended utm_source/utm_medium values, real examples, and what to avoid — free UTM builder.",
    whyItMatters:
      "Facebook spans dramatically different surfaces — organic page posts, group shares, Messenger forwards, paid ads, Marketplace, even FB Lite. Each has different click-through behavior and different attribution implications. A clean UTM strategy lets you cut your Facebook spend with confidence; a sloppy one means you can't tell which surface is actually performing.",
    recommendedSource: "facebook",
    recommendedMedium: "social",
    campaignPattern: "facebook-{topic}-{date}",
    examples: [
      {
        context: "Organic company page post",
        url: `${baseUrl}?utm_source=facebook&utm_medium=social&utm_campaign=blog-launch-2026q2`,
      },
      {
        context: "Facebook Ads (Meta Ads Manager)",
        url: `${baseUrl}?utm_source=facebook&utm_medium=cpc&utm_campaign=acquisition-2026q2&utm_content=video-v3`,
      },
      {
        context: "Shared in a Facebook Group",
        url: `${baseUrl}?utm_source=facebook&utm_medium=group&utm_campaign=community-q2`,
      },
      {
        context: "Sent via Messenger broadcast",
        url: `${baseUrl}?utm_source=facebook&utm_medium=messenger&utm_campaign=re-engagement-may`,
      },
    ],
    gotchas: [
      "Meta Ads Manager has built-in URL parameters — make sure your UTM in the destination URL doesn't conflict with Meta's auto-appended fbclid/utm parameters.",
      "Facebook strips some URL fragments on mobile shares — test your UTM URLs on iOS and Android before scaling spend.",
      "Don't use utm_source=fb or utm_source=meta. Stick with `facebook` so reports stay consistent across teams that may use either name.",
      "When boosting an organic post, Meta creates a new URL with cpc tracking — your organic UTM stays attached to the original organic post; the boosted version inherits Meta's ad UTM. Plan for this so you don't double-count.",
    ],
    faqs: [
      {
        q: "What utm_source value should I use for Facebook?",
        a: "Use `utm_source=facebook` (lowercase). Avoid abbreviations like 'fb' or 'FB' — they fragment your data in reports.",
      },
      {
        q: "Should I use utm_medium=social or utm_medium=cpc for Facebook Ads?",
        a: "Use `utm_medium=cpc` for paid Facebook Ads (Meta Ads Manager campaigns). Use `utm_medium=social` for organic page posts. This separation is essential for measuring paid vs organic ROI.",
      },
      {
        q: "What's the difference between fbclid and UTM parameters?",
        a: "Facebook automatically adds an `fbclid` parameter for click tracking on its own platform. UTM parameters are for YOUR analytics tool (GA4, Mixpanel, etc.). You need both — fbclid for Meta's reporting, UTM for everywhere else.",
      },
      {
        q: "How do I track Facebook Group posts separately from page posts?",
        a: "Use `utm_medium=group` (or include the group name in utm_campaign) for posts shared in Groups. This separates community-driven traffic from your owned channels.",
      },
      {
        q: "Can I track which Facebook ad creative drove conversions?",
        a: "Yes. Use `utm_content` to identify each creative variant (utm_content=video-v3 vs utm_content=static-v3). Combined with utm_campaign, this gives you creative-level attribution.",
      },
    ],
  },

  // -------- Instagram --------
  {
    slug: "instagram",
    name: "Instagram",
    shortName: "Instagram",
    searchPhrase: "Instagram UTM builder",
    metaDescription:
      "Build Instagram UTM tracking links for bio, stories, reels, and ads. Solves the no-links-in-captions problem with proper attribution across IG surfaces — free UTM builder.",
    whyItMatters:
      "Instagram is the hardest mainstream channel to attribute because captions don't allow clickable links — everything funnels through your bio, stories, reels CTAs, and ads. Without UTMs, every Instagram visit looks like 'direct' or 'instagram / referral' and you can't tell whether your story is converting better than your reel. A per-surface UTM strategy is the only way to measure Instagram's real impact.",
    recommendedSource: "instagram",
    recommendedMedium: "social",
    campaignPattern: "instagram-{surface}-{date}",
    examples: [
      {
        context: "Bio link (link in bio)",
        url: `${baseUrl}?utm_source=instagram&utm_medium=bio&utm_campaign=bio-2026q2`,
      },
      {
        context: "Story swipe-up / link sticker",
        url: `${baseUrl}?utm_source=instagram&utm_medium=story&utm_campaign=behind-the-scenes-may`,
      },
      {
        context: "Reel CTA / linked from Linktree",
        url: `${baseUrl}?utm_source=instagram&utm_medium=reel&utm_campaign=tutorial-may&utm_content=reel-2026-05-19`,
      },
      {
        context: "Instagram Ads (paid)",
        url: `${baseUrl}?utm_source=instagram&utm_medium=cpc&utm_campaign=acquisition-2026q2`,
      },
    ],
    gotchas: [
      "Linktree-style services often drop UTM parameters by default. Use Linkby, Beacons, or a custom landing page that explicitly preserves your UTM params.",
      "Update your bio link UTM at least quarterly (utm_campaign=bio-2026q2 → bio-2026q3) so you can chart bio traffic trends over time.",
      "Stories disappear after 24h but the swipe-up clicks are tracked indefinitely — use utm_campaign=story-{topic} to keep historical data clean.",
      "Don't use 'IG' or 'insta' as utm_source — pick `instagram` and stick with it across every team that builds links.",
    ],
    faqs: [
      {
        q: "How do I track Instagram bio link traffic?",
        a: "Build a UTM-tagged URL (utm_source=instagram, utm_medium=bio, utm_campaign=bio-2026q2) and put THAT URL in your bio — not your raw site URL. Update the utm_campaign each quarter to chart trends.",
      },
      {
        q: "Should Linktree preserve my UTM parameters?",
        a: "Default Linktree behavior often replaces destination URLs with Linktree's own redirect, which strips UTMs. Switch to a service that supports passthrough UTM (Linkby, Beacons.ai with custom domain) or build a static bio-link page yourself.",
      },
      {
        q: "What's the right utm_medium for Instagram Stories?",
        a: "Use `utm_medium=story` for organic stories with a link sticker. For paid Story ads, use `utm_medium=cpc` — keeping paid and organic separate is the entire point.",
      },
      {
        q: "Can I track which Reel drove traffic?",
        a: "Yes. Use a unique `utm_content` per reel (utm_content=reel-2026-05-19) and update the bio link each time you post. Or maintain a Linktree-style page where each reel CTA has its own utm_content.",
      },
      {
        q: "What utm_source value should I use for Instagram?",
        a: "Use `utm_source=instagram` (lowercase, full word). Avoid 'IG', 'insta', or 'Instagram' — case and abbreviation inconsistencies fragment your reports.",
      },
    ],
  },

  // -------- TikTok --------
  {
    slug: "tiktok",
    name: "TikTok",
    shortName: "TikTok",
    searchPhrase: "TikTok UTM builder",
    metaDescription:
      "Build TikTok UTM tracking links for bio, ads, and creator collabs. Solves attribution across TikTok's link-in-bio funnel and TikTok Ads Manager — free UTM builder.",
    whyItMatters:
      "TikTok's organic traffic almost always routes through your bio link, which means every viral TikTok dumps undifferentiated traffic into one entry point. Without UTMs you can't tell which video drove the conversion — and TikTok's own analytics stop at the click. Tagging your bio link per-campaign (and updating it when you push a new viral hook) is the only reliable way to attribute TikTok's real revenue impact.",
    recommendedSource: "tiktok",
    recommendedMedium: "social",
    campaignPattern: "tiktok-{hook}-{date}",
    examples: [
      {
        context: "TikTok bio link",
        url: `${baseUrl}?utm_source=tiktok&utm_medium=bio&utm_campaign=bio-2026q2`,
      },
      {
        context: "Linked from a viral hook (Beacons/Linktree)",
        url: `${baseUrl}?utm_source=tiktok&utm_medium=bio&utm_campaign=launch-may&utm_content=hook-day-in-life`,
      },
      {
        context: "TikTok Ads Manager spark ad",
        url: `${baseUrl}?utm_source=tiktok&utm_medium=cpc&utm_campaign=acquisition-2026q2&utm_content=spark-creator-jane`,
      },
      {
        context: "Creator collab with link in caption (via TikTok Shop / branded content)",
        url: `${baseUrl}?utm_source=tiktok&utm_medium=creator&utm_campaign=collab-may&utm_content=creator-name`,
      },
    ],
    gotchas: [
      "TikTok requires 1000+ followers for clickable bio links — until then your only attribution path is asking users 'how did you hear?'. Plan UTMs from day 1k.",
      "TikTok shortens links inside videos (TikTok Shop) with their own tracker — your UTM still survives the redirect, but verify in your analytics before scaling.",
      "Rotate your bio link UTM_campaign whenever you change your hook so traffic spikes are attributable to specific content.",
      "Don't use 'tt' or 'TikTok' (capitalization) as utm_source — pick `tiktok` (lowercase) and lock it in.",
    ],
    faqs: [
      {
        q: "How do I track which TikTok drove a conversion if all traffic goes through my bio link?",
        a: "Update your bio link's utm_campaign or utm_content each time you post (or each viral hook). For example: utm_content=hook-day-in-life when that video is your hero, then swap to utm_content=hook-cold-open when the next one trends. You'll see exactly which video brought which traffic in your analytics.",
      },
      {
        q: "Do TikTok Ads automatically add UTM parameters?",
        a: "No. TikTok Ads Manager adds its own click tracking (ttclid) but does NOT add UTM parameters. You need to manually add UTMs to your destination URL in the ad setup. Use utm_source=tiktok, utm_medium=cpc.",
      },
      {
        q: "Can I track TikTok Shop traffic separately?",
        a: "Yes. Use utm_medium=tiktok-shop in your product link UTM, separate from utm_medium=social for organic content. This isolates Shop revenue from regular bio-link clicks.",
      },
      {
        q: "What utm_source should I use for TikTok?",
        a: "`utm_source=tiktok` (lowercase). Avoid 'TT', 'tt', or 'TikTok' (mixed case) — they create duplicate sources in reports.",
      },
      {
        q: "How do creator collabs get tracked?",
        a: "Give each creator a unique UTM (utm_source=tiktok, utm_medium=creator, utm_content=creator-handle). This is the fairest way to attribute revenue back to each creator and pay accordingly.",
      },
    ],
  },

  // -------- YouTube --------
  {
    slug: "youtube",
    name: "YouTube",
    shortName: "YouTube",
    searchPhrase: "YouTube UTM builder",
    metaDescription:
      "Build YouTube UTM tracking links for video descriptions, cards, end-screens, and ads. Track per-video and per-creator traffic with proper attribution — free UTM builder.",
    whyItMatters:
      "YouTube descriptions, pinned comments, end-screens, and ads all send traffic to your site — but in your analytics they all look like 'youtube.com / referral' if you don't tag them. UTMs let you separate the video that sold from the playlist that didn't, and they make YouTube Ads attribution actually measurable.",
    recommendedSource: "youtube",
    recommendedMedium: "video",
    campaignPattern: "youtube-{topic}-{date}",
    examples: [
      {
        context: "Link in video description",
        url: `${baseUrl}?utm_source=youtube&utm_medium=video&utm_campaign=tutorial-may&utm_content=description-link`,
      },
      {
        context: "Pinned comment link",
        url: `${baseUrl}?utm_source=youtube&utm_medium=video&utm_campaign=tutorial-may&utm_content=pinned-comment`,
      },
      {
        context: "End-screen / card",
        url: `${baseUrl}?utm_source=youtube&utm_medium=video&utm_campaign=tutorial-may&utm_content=end-screen`,
      },
      {
        context: "YouTube Ads (in-stream)",
        url: `${baseUrl}?utm_source=youtube&utm_medium=cpc&utm_campaign=acquisition-2026q2&utm_content=in-stream-15s`,
      },
    ],
    gotchas: [
      "YouTube descriptions show a preview of long URLs and chop them off. Use a clean short URL or shortener that preserves your UTMs.",
      "Don't use utm_medium=youtube — that conflates source and medium. Use utm_medium=video for organic content, utm_medium=cpc for ads.",
      "Pin-comment links and description links get different click rates — tag them separately (utm_content=pinned vs utm_content=description) so you can A/B which works better.",
      "YouTube Shorts has different click behavior than long-form — separate the utm_campaign so you can compare conversion rates by format.",
    ],
    faqs: [
      {
        q: "What's the recommended utm_medium for YouTube?",
        a: "Use `utm_medium=video` for organic YouTube content (description links, pinned comments, end-screens) and `utm_medium=cpc` for YouTube Ads. Some teams use utm_medium=social, but video is cleaner because it distinguishes YouTube traffic from text-based social.",
      },
      {
        q: "Can I track which video drove a conversion?",
        a: "Yes — set a unique utm_campaign per video (utm_campaign=tutorial-2026-05-19) and use utm_content for placement within that video (description, pinned, end-screen).",
      },
      {
        q: "Do YouTube Ads add UTM parameters automatically?",
        a: "Google Ads can auto-tag with GCLID (Google Click Identifier) for Google Ads attribution. UTMs are separate — you add them in the destination URL inside Google Ads. Use utm_source=youtube, utm_medium=cpc to keep YouTube Ads distinct from Google Search Ads.",
      },
      {
        q: "How do I track end-screen vs description-link clicks?",
        a: "Use different utm_content values per placement: utm_content=end-screen, utm_content=description-link, utm_content=pinned-comment. This is the simplest way to A/B test placement effectiveness.",
      },
      {
        q: "Should I track YouTube Shorts differently?",
        a: "Yes. Use utm_campaign=shorts-* for Shorts and utm_campaign=longform-* for regular videos. Click-through behavior differs significantly between formats.",
      },
    ],
  },

  // -------- X / Twitter --------
  {
    slug: "twitter",
    name: "X (Twitter)",
    shortName: "X / Twitter",
    searchPhrase: "Twitter / X UTM builder",
    metaDescription:
      "Build X (Twitter) UTM tracking links for tweets, DMs, ads, and profile bio. Recommended source values for the X-vs-Twitter naming shift — free UTM builder.",
    whyItMatters:
      "X (formerly Twitter) shows surprising amounts of attribution leakage — links inside threads, replies, DMs, and Twitter Ads all collapse to 't.co / referral' unless you UTM-tag them. The shift from Twitter to X also means most teams now have a mix of utm_source=twitter and utm_source=x in their data — pick one and standardize.",
    recommendedSource: "twitter",
    recommendedMedium: "social",
    campaignPattern: "twitter-{topic}-{date}",
    examples: [
      {
        context: "Single tweet linking to a blog post",
        url: `${baseUrl}?utm_source=twitter&utm_medium=social&utm_campaign=blog-launch-2026q2`,
      },
      {
        context: "Thread CTA at the end",
        url: `${baseUrl}?utm_source=twitter&utm_medium=social&utm_campaign=thread-may&utm_content=cta-tweet`,
      },
      {
        context: "X Ads (Promoted Tweet)",
        url: `${baseUrl}?utm_source=twitter&utm_medium=cpc&utm_campaign=acquisition-2026q2`,
      },
      {
        context: "DM-shared link / outbound",
        url: `${baseUrl}?utm_source=twitter&utm_medium=dm&utm_campaign=outbound-may`,
      },
    ],
    gotchas: [
      "X shortens links via t.co — your UTM survives the redirect, but make sure your URL is verbose enough to be legible when the t.co preview unwraps in someone's analytics.",
      "Decide once: utm_source=twitter or utm_source=x. Don't mix. Most teams stay on `twitter` for historical continuity.",
      "Thread CTAs get higher CTR than the opening tweet — tag the final tweet's link with utm_content=thread-cta to measure this.",
      "X Ads dashboard reports separately from your analytics — UTMs are how you reconcile the two.",
    ],
    faqs: [
      {
        q: "Should I use utm_source=twitter or utm_source=x?",
        a: "Most teams stick with `utm_source=twitter` for historical data continuity — your old reports already use it, and switching mid-stream fragments your data. If you're starting fresh, `x` is fine but commit to one.",
      },
      {
        q: "Does X / Twitter strip UTM parameters?",
        a: "No. X wraps your URL in a t.co redirect for click tracking, but the underlying URL with all UTM parameters intact is what the user lands on. Your analytics will see the full UTM string.",
      },
      {
        q: "What utm_medium should I use for X Ads?",
        a: "`utm_medium=cpc` for paid Promoted Tweets and Promoted Accounts. `utm_medium=social` for organic tweets.",
      },
      {
        q: "How do I track tweet threads where the CTA is at the bottom?",
        a: "Add utm_content=thread-cta (or utm_content=closing-tweet) to the link in your final tweet. This isolates thread-end traffic so you can measure whether your closing matters.",
      },
      {
        q: "Can I track DM-shared links?",
        a: "Yes. Use utm_medium=dm (instead of social) for links you send in DMs. This separates outbound effort from organic feed traffic.",
      },
    ],
  },

  // -------- Google Ads --------
  {
    slug: "google-ads",
    name: "Google Ads",
    shortName: "Google Ads",
    searchPhrase: "Google Ads UTM builder",
    metaDescription:
      "Build Google Ads UTM tracking links with the right utm_source/utm_medium for Search, Display, Shopping, and YouTube campaigns. Plays nicely with auto-tagging (gclid).",
    whyItMatters:
      "Google Ads already auto-tags clicks with `gclid` so Google Analytics knows the source, but if you use any other analytics tool (Mixpanel, Amplitude, PostHog) you need explicit UTMs to attribute Google Ads traffic correctly. UTMs also let you separate Search from Display from Shopping inside the same analytics tool without piecing it together from gclid metadata.",
    recommendedSource: "google",
    recommendedMedium: "cpc",
    campaignPattern: "google-{network}-{topic}",
    examples: [
      {
        context: "Google Search Ad",
        url: `${baseUrl}?utm_source=google&utm_medium=cpc&utm_campaign=brand-search-2026q2&utm_content=ad-v3`,
      },
      {
        context: "Google Display Network",
        url: `${baseUrl}?utm_source=google&utm_medium=display&utm_campaign=retargeting-2026q2&utm_content=banner-300x250`,
      },
      {
        context: "Google Shopping",
        url: `${baseUrl}?utm_source=google&utm_medium=shopping&utm_campaign=ecom-2026q2`,
      },
      {
        context: "Performance Max",
        url: `${baseUrl}?utm_source=google&utm_medium=pmax&utm_campaign=demand-gen-2026q2`,
      },
    ],
    gotchas: [
      "If GA4 auto-tagging is on, UTMs you set manually take precedence — make sure your manual UTMs match your intent or disable manual tagging.",
      "Use ValueTrack parameters ({keyword}, {placement}) inside utm_term and utm_content to dynamically capture which keyword and placement triggered the click.",
      "Google Shopping clicks need utm_medium=shopping (not cpc) so your reports separate Shopping ROAS from Search ROAS.",
      "For Performance Max, use a single utm_medium=pmax — PMax doesn't expose enough sub-detail to split further.",
    ],
    faqs: [
      {
        q: "Do I need UTMs if I have Google Ads auto-tagging on?",
        a: "If you ONLY use Google Analytics, no — gclid handles it. If you use Mixpanel, Amplitude, PostHog, or any other analytics tool, yes — those tools don't read gclid and need explicit UTM parameters to attribute Google Ads traffic.",
      },
      {
        q: "What utm_source value should I use for Google Ads?",
        a: "`utm_source=google` (lowercase). Don't use 'googleads' or 'adwords' — Google deprecated AdWords, and `google` is the standard.",
      },
      {
        q: "How should I differentiate Search vs Display vs Shopping?",
        a: "Use utm_medium to distinguish: `cpc` for Search, `display` for Display Network, `shopping` for Google Shopping, `pmax` for Performance Max. utm_source stays `google` across all of them.",
      },
      {
        q: "Can I dynamically insert the keyword that triggered the click?",
        a: "Yes — use ValueTrack: `utm_term={keyword}`. Google replaces {keyword} at click time with the matched keyword. Same trick works for placement, device, etc.",
      },
      {
        q: "What's the difference between gclid and UTMs?",
        a: "`gclid` is Google's click identifier — opaque, internal, only readable by Google Analytics. UTMs are open, human-readable parameters readable by every analytics tool. Use both: gclid for Google's reporting, UTMs for everyone else.",
      },
    ],
  },

  // -------- Email --------
  {
    slug: "email",
    name: "Email",
    shortName: "Email",
    searchPhrase: "Email UTM builder",
    metaDescription:
      "Build UTM tracking links for marketing emails — Mailchimp, Klaviyo, HubSpot, transactional, drip. Per-link attribution and broadcast vs automation separation — free UTM builder.",
    whyItMatters:
      "Without UTMs, every email click shows up as 'direct' or your ESP's name (mailchimp.com / referral) in your analytics. You can't tell whether your welcome series outperforms your weekly broadcast, whether the CTA at the top or bottom of the email converts better, or whether a single drip step is actually driving revenue. Per-link UTMs are the price of admission for measuring email properly.",
    recommendedSource: "email",
    recommendedMedium: "email",
    campaignPattern: "{esp}-{campaign-name}-{date}",
    examples: [
      {
        context: "Mailchimp weekly newsletter",
        url: `${baseUrl}?utm_source=mailchimp&utm_medium=email&utm_campaign=weekly-2026-05-19&utm_content=hero-cta`,
      },
      {
        context: "Klaviyo welcome series — email 2",
        url: `${baseUrl}?utm_source=klaviyo&utm_medium=email&utm_campaign=welcome-series&utm_content=email-2-cta`,
      },
      {
        context: "HubSpot drip — re-engagement",
        url: `${baseUrl}?utm_source=hubspot&utm_medium=email&utm_campaign=re-engagement-q2&utm_content=link-1`,
      },
      {
        context: "Transactional email (order confirmation upsell)",
        url: `${baseUrl}?utm_source=postmark&utm_medium=email&utm_campaign=order-confirm-upsell`,
      },
    ],
    gotchas: [
      "Use your ESP name as utm_source (mailchimp, klaviyo, hubspot, postmark) rather than the generic 'email' so you can compare ESPs over time.",
      "Many ESPs auto-append their own tracking parameter — make sure yours don't conflict with the UTMs. Mailchimp adds `mc_cid` and `mc_eid`; Klaviyo adds `_kx`. These coexist with UTMs.",
      "Use utm_content to tag each LINK in the email separately (hero-cta, footer-link, image-tile) — this is how you measure which CTA placement actually converts.",
      "For drip series, include the email number in utm_content (email-1-cta, email-2-cta) so you can see drop-off through the sequence.",
    ],
    faqs: [
      {
        q: "What's the right utm_source for emails — 'email' or my ESP name?",
        a: "Use the ESP name (`utm_source=mailchimp`, `utm_source=klaviyo`, `utm_source=hubspot`). It's more specific and lets you compare ESPs if you ever migrate. `utm_medium=email` does the broad categorization.",
      },
      {
        q: "Should I track every link in an email separately?",
        a: "Yes. Use utm_content to identify each link's placement: utm_content=hero-cta, utm_content=footer-link, utm_content=image-tile. This is how you A/B test CTA placement.",
      },
      {
        q: "How do I track drip series emails?",
        a: "Keep utm_campaign consistent across the series (utm_campaign=welcome-series) and use utm_content for the email number + link (utm_content=email-2-cta). You can chart drop-off through the sequence in one report.",
      },
      {
        q: "Do Mailchimp's mc_cid and mc_eid parameters replace UTMs?",
        a: "No — they're Mailchimp's internal tracking. UTMs are for YOUR analytics. Both coexist on the same URL and serve different reports.",
      },
      {
        q: "Can I tag transactional emails with UTMs?",
        a: "Yes, and you should. Transactional traffic (order confirmations, password resets) often includes upsell or re-engagement opportunities. Tag those links (utm_medium=email, utm_campaign=order-confirm-upsell) to measure revenue lift.",
      },
    ],
  },

  // -------- Newsletter --------
  {
    slug: "newsletter",
    name: "Newsletter",
    shortName: "Newsletter",
    searchPhrase: "Newsletter UTM builder",
    metaDescription:
      "Build UTM links for newsletter campaigns — Substack, Beehiiv, Ghost, Mailchimp. Per-issue and per-link attribution, with sponsorship and cross-promo tracking — free UTM builder.",
    whyItMatters:
      "Newsletter traffic is high-intent but invisible without UTMs — every Substack/Beehiiv/Ghost click reports as 'direct' or the platform domain. For sponsored newsletter placements you need rock-solid attribution to justify spend; for your own newsletter you need per-issue UTMs to measure which subject line and which link placement actually moved the needle.",
    recommendedSource: "newsletter",
    recommendedMedium: "email",
    campaignPattern: "newsletter-{issue}-{date}",
    examples: [
      {
        context: "Your own newsletter (Substack/Beehiiv) — hero CTA",
        url: `${baseUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=issue-42&utm_content=hero-cta`,
      },
      {
        context: "Newsletter — secondary link in body",
        url: `${baseUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=issue-42&utm_content=body-link-3`,
      },
      {
        context: "Sponsored placement in another newsletter",
        url: `${baseUrl}?utm_source=morning-brew&utm_medium=email&utm_campaign=sponsored-2026q2&utm_content=hero-placement`,
      },
      {
        context: "Cross-promo swap with another newsletter",
        url: `${baseUrl}?utm_source=lenny-newsletter&utm_medium=email&utm_campaign=cross-promo-may`,
      },
    ],
    gotchas: [
      "For sponsored placements, name the source after the newsletter you're being placed in (utm_source=morning-brew), not the generic 'newsletter' — this gives you ROAS per partner.",
      "Use utm_content to separate hero, body, and footer placements in your own newsletter. The conversion rate gap is often 5-10x.",
      "Beehiiv/Substack often append their own click tracker — your UTMs survive but verify the destination URL in a test issue before scaling.",
      "Use utm_campaign=issue-{number} so you can chart engagement per issue and identify which subject lines drove the most traffic.",
    ],
    faqs: [
      {
        q: "Should I use utm_source=newsletter or my newsletter name?",
        a: "For YOUR own newsletter, `utm_source=newsletter` is fine. For sponsored placements in someone else's newsletter, use the publication name (utm_source=morning-brew, utm_source=lenny-newsletter) so you can measure ROAS per partner.",
      },
      {
        q: "What's the right utm_medium for newsletter links?",
        a: "`utm_medium=email`. Don't use `utm_medium=newsletter` — it conflates medium with the campaign type. Stick with email so cross-channel reports stay consistent.",
      },
      {
        q: "How do I track sponsored newsletter placements?",
        a: "Build a unique UTM per placement: utm_source={publication-name}, utm_medium=email, utm_campaign=sponsored-2026q2, utm_content={placement-type}. This isolates each sponsorship for ROAS measurement.",
      },
      {
        q: "Can I track which issue drove the most subscribers?",
        a: "Yes. Set utm_campaign=issue-{number} consistently. Then in your analytics, group by utm_campaign and you'll see traffic, conversions, and revenue per issue.",
      },
      {
        q: "Do Substack/Beehiiv strip UTM parameters?",
        a: "No. Both platforms add their own click tracking but pass through your UTMs intact. The user's browser receives the full URL with your UTMs preserved.",
      },
    ],
  },

  // -------- Reddit --------
  {
    slug: "reddit",
    name: "Reddit",
    shortName: "Reddit",
    searchPhrase: "Reddit UTM builder",
    metaDescription:
      "Build UTM tracking links for Reddit — subreddit posts, comments, ads, and outbound DMs. Survives Reddit's URL handling and separates organic from paid — free UTM builder.",
    whyItMatters:
      "Reddit is a notoriously hard-to-track traffic source — links in comments and self-posts often show up as 'reddit.com / referral' or worse, 'direct'. Without UTMs you can't separate the subreddit where your post hit the front page from the one where it died, and you definitely can't measure Reddit Ads ROI. A simple per-subreddit UTM convention solves both.",
    recommendedSource: "reddit",
    recommendedMedium: "social",
    campaignPattern: "reddit-{subreddit}-{topic}",
    examples: [
      {
        context: "Self-post in r/SaaS with a link in the body",
        url: `${baseUrl}?utm_source=reddit&utm_medium=social&utm_campaign=saas-launch&utm_content=r-saas`,
      },
      {
        context: "Comment link in r/IndieHackers",
        url: `${baseUrl}?utm_source=reddit&utm_medium=social&utm_campaign=indie-hackers-may&utm_content=comment-thread-1`,
      },
      {
        context: "Reddit Ads (paid)",
        url: `${baseUrl}?utm_source=reddit&utm_medium=cpc&utm_campaign=acquisition-2026q2&utm_content=image-ad-v2`,
      },
      {
        context: "Outbound DM share",
        url: `${baseUrl}?utm_source=reddit&utm_medium=dm&utm_campaign=outbound-may`,
      },
    ],
    gotchas: [
      "Reddit's old.reddit.com and new.reddit.com referral strings look slightly different — UTMs let you bypass that mess entirely.",
      "Tag each subreddit separately in utm_content (utm_content=r-saas, utm_content=r-indiehackers) — Reddit's analytics won't tell you which subreddit converted, but UTMs will.",
      "Reddit Ads dashboard reports separately from your site analytics; use utm_medium=cpc with utm_source=reddit to reconcile.",
      "Comment-link traffic often outperforms self-post traffic because the link is contextual — measure both so you know where to invest.",
    ],
    faqs: [
      {
        q: "What's the recommended utm_source for Reddit?",
        a: "`utm_source=reddit` (lowercase). Avoid 'Reddit' or 'r/' prefixes in utm_source — use utm_content for the subreddit name instead.",
      },
      {
        q: "How do I track which subreddit drove the most traffic?",
        a: "Use utm_content to identify the subreddit: utm_content=r-saas, utm_content=r-indiehackers. Reddit's referral data is unreliable for this — UTMs give you clean per-subreddit attribution.",
      },
      {
        q: "Do Reddit Ads add UTMs automatically?",
        a: "No. Reddit Ads has its own click tracking but does NOT auto-append UTMs. You add them manually in the destination URL field when setting up the ad.",
      },
      {
        q: "Can I track comment-link clicks separately from self-post clicks?",
        a: "Yes. Use different utm_content values: utm_content=comment-thread-1 vs utm_content=self-post. This is the only way to A/B test where Reddit traffic actually comes from.",
      },
      {
        q: "Will Reddit strip my UTM parameters?",
        a: "No. Reddit preserves URL parameters in posts, comments, and ads. The user clicks through with your full UTM intact.",
      },
    ],
  },
] as const;

export function findChannel(slug: string): UtmChannel | undefined {
  return UTM_CHANNELS.find((c) => c.slug === slug);
}
