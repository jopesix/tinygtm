# TinyGTM

**Tiny tools for go-to-market.**

Small, focused marketing utilities for solo founders, marketers, and small
GTM teams. Each tool does one annoying job well — open it, paste your
context, get usable output. No platform to learn.

Think Goblin Tools, but for marketing.

---

## The suite

| # | Tool | Purpose | Status | Repo |
| - | - | - | - | - |
| 1 | **UTM Builder** | Build, store, and reuse campaign tracking links without breaking naming conventions. Duplicate detection, CSV export. | 🟢 Live | [utm-builder](https://github.com/jopesix/utm-builder) |
| 2 | **Campaign Brief Writer** | Turn messy kickoff notes, transcripts, and Slack threads into a structured campaign brief and tailored launch checklist. | ⚪ Planned | — |
| 3 | **Product FAQ Generator** | Generate realistic customer FAQs from product docs, URLs, PRDs, and call notes — grouped by persona, grounded in source material. | ⚪ Planned | — |
| 4 | **Experiment Generator** | Generate structured growth experiments your team can actually run — across paid, lifecycle, content, onboarding. Keep a log. | ⚪ Planned | — |

---

## Principles

- **One job per tool.** Each utility is a single focused workflow, not a
  platform.
- **Paste in, copy out.** Most flows are *paste your context → get usable
  output*. Minimal forms, no required onboarding.
- **Free to try.** No sign-up to generate. Auth is only for saving and sync.
- **Marketer-friendly defaults.** Sensible naming, structure, and language
  out of the box — overrideable, not bureaucratic.

---

## Repo layout

TinyGTM is a suite, not a monorepo. Each tool lives in its own repo with
its own deploy pipeline, so they can ship independently. This repo holds:

- The shared product manifesto + brand notes
- The marketing landing page (when it ships)
- An index of every tool repo

---

## Status

Building tool #1 — [UTM Builder](https://github.com/jopesix/utm-builder).
Marketing site comes after #2.
