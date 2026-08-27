# Wishlist Non-Conversion — A Case Study

**Status: first draft, for review. Not final.** Every claim below is sourced from a file already in this repo (cited inline); nothing here is invented or projected. Sections where real content doesn't exist yet are marked **⚠️ GAP** rather than filled with placeholder prose.

---

## Problem statement

Fashion-ecommerce wishlists accumulate saved items that never convert to purchase. The brief's own open question — and this project's highest-leverage hypothesis (**H2**, `docs/hypotheses.md`) — is whether that non-conversion reflects unresolved *purchase intent blocked by a specific barrier* (price, fit, occasion, quality, timing, availability), or whether a material share of saves were never real purchase intent at all (a "bookmark," not a stalled purchase). The project's job was to find out which, for which segment, with real evidence — not assume either answer.

The sharpest, most-triangulated finding is **availability decay**: every one of the 6 interview subjects independently described a wishlisted item going out of stock or size before they decided, and 32/32 survey respondents (100%) report the same experience (`docs/research-findings.md`). It leads this project's problem-statement framing for that reason. It is not, however, the *only* barrier this project found real evidence for — four other barriers (price certainty, fit/size, quality/trust, occasion/styling) are each independently confirmed by a different method (corpus, interview, or survey). Rather than force a single winner out of genuinely multi-barrier evidence, this project reports what was actually found: see `docs/decisions/opportunity-selection.md` for the full reasoning and why the blueprint's original single-opportunity kill-criteria process (`docs/hypotheses.md` C.3) was assessed as inapplicable here, not skipped. The MVP's five personas reflect that same breadth — five real, differently-confirmed barriers, not indecision about picking one.

Six hypotheses were frozen before any coding run started (`docs/hypotheses.md`, frozen 2026-08-19):

- **H1** — Non-conversion is primarily unresolved uncertainty, not forgetting.
- **H2** — A material share of adds were never purchase intent (bookmark vs. intent).
- **H3** — The dominant uncertainty differs by segment.
- **H4** — Users resolve uncertainty outside the app and often don't return.
- **H5** — Availability decay silently kills a share of high-intent saves.
- **H6** — Users prefer explainable output over confident black-box output.

---

## Architecture

⚠️ **GAP** — no `docs/architecture.md` exists in this repo. The description below is assembled from the pipeline scripts and blueprint docs that do exist; it hasn't been written up as its own architecture document.

At a high level:

1. **Scrapers** (`scrapers/playstore.py`, `scrapers/appstore.py`) pull raw review text into a unified schema (`docs/decisions/unified-data-schema.md`).
2. **`pipeline/clean.py`** dedupes, drops non-English/too-short text, and PII-scrubs.
3. **`pipeline/relevance_prefilter.py`** — a minimal, `is_relevant`-only LLM pre-filter (not the frozen Coding Agent) — was used for the early viability pilot and the v2 corpus reclassification, producing the relevant-rate numbers below.
4. **`agents/coding_agent_prompt.md`** — the frozen, full barrier-classification prompt (fit_size / price_certainty / occasion_styling / quality_trust / availability_decay / timing_forgetting / bookmark_not_intent / other / not_relevant). Gate cleared 2026-08-25 once the gold set froze; **has only been run against the 137-item gold set for evaluation (E1/E3), not against the full ~2,900-item corpus yet** (see Limitations).
5. **`pipeline/stats.py`** — deterministic aggregation only. The LLM classifies one item at a time; Python computes every percentage. No prevalence claim is ever made by the LLM itself.
6. **`workflows/discovery-engine-webhook.json`** — an n8n workflow wrapping the same classification call behind a webhook, live-tested first against a local n8n instance (`docs/FAILURES.md`, 2026-08-22 entries — 4 real bugs found and fixed there), and now deployed live on n8n Cloud with a public webhook URL — see Live Links.
7. **MVP** (`mvp/`) — a Vite + React app demonstrating the deterministic-core-then-narration pattern on simulated wishlist data. Deployed and live (link below).

---

## What was actually found

### Corpus (review-text) relevance rates

From `data/processed/relevance_summary.json` (v2 prompt, checkpointed run — see Limitations for completeness caveat):

| Source | Total classified | Relevant | Rate |
|---|---|---|---|
| AJIO (Play Store) | 576 | 20 | 3.5% |
| Myntra (Play Store) | 488 | 4 | 0.8% |
| AJIO (App Store) | 411 | 2 | 0.5% |
| Myntra (App Store) | 288 | 8 | 2.8% |
| Nykaa (App Store) | 440 | 5 | 1.1% |

These rates are consistent with the original viability-pilot finding (`docs/decisions/product-and-source-choice.md`): Play Store review text is structurally biased toward post-purchase logistics complaints, not pre-purchase hesitation — none of the three original apps cleared even the low end of the pre-registered 1–3% estimate under the v1 pilot prompt.

### Primary research: survey (n=32) + 6 interviews

Full detail and the confirm/contradict matrix live in `docs/research-findings.md` (survey + interviews reviewed with the user, logged 2026-08-25). Key numbers:

- **Why saved:** plan to buy soon 11/32, liked but unsure 11/32, comparing options 7/32, browsing/inspiration only 3/32.
- **Biggest reason not bought:** price uncertainty 9, quality doubt 7, fit doubt 6, occasion fit 4, forgot 3.
- **30/32 (94%)** look outside the app before deciding; only 2/32 decide app-only.
- **32/32 (100%)** have had a wishlisted item go out of stock/sold out in their size before deciding.
- **Size-prediction trust:** 19/32 "trust but would double-check" — the largest single group, neither blind trust nor distrust.

### The corpus-vs-interview finding

This is the project's sharpest finding. Of the 7 barrier categories in the codebook, only **2 (`quality_trust`, `availability_decay`)** have real positive examples in the Play Store review corpus. The other four — **`fit_size`, `occasion_styling`, `timing_forgetting`, `bookmark_not_intent`** — are **corpus-near-zero or corpus-zero**, but every one of them is **interview-confirmed real** (`docs/research-findings.md` Part 4):

- `fit_size` and `price_certainty`: confirmed via P1, P2, P6 interview transcripts, and price_certainty is the single largest reason-not-bought in the survey (9/32) despite having zero clean Play Store examples.
- `occasion_styling`: confirmed via P3, P5.
- `timing_forgetting`: confirmed via P6 (explicitly distinguished from deliberate deferral).
- `bookmark_not_intent` (H2): confirmed as **real but a minority pattern** — 1 of 6 interviews (P3), ~9% by survey ("browsing/inspiration only"). H2 is not falsified, but it's narrower than the hypothesis implied: most saves reflect genuine deferred intent blocked by a specific barrier, not an inflated denominator.

The interpretation logged in `docs/research-findings.md`: app-review text structurally under-counts pre-purchase hesitation because of *what makes someone write a review at all* — this is a corpus-methodology limitation, not evidence the categories aren't real.

---

## Live links

- **MVP:** https://mvp-henna-delta.vercel.app
- **Discovery-engine n8n workflow (testable AI discovery engine):** https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine — live on n8n Cloud, verified 2026-08-27 by direct POST against the production URL (not just import success): a real classification returns `{"status":"ok","result":{...,"is_relevant":true,"primary_barrier":"price_certainty",...}}`, a not-relevant text correctly returns `is_relevant:false`, and an empty-body POST correctly returns `400 {"status":"error","error":"text field is required..."}`. See `docs/decisions/discovery-engine-hosting.md` for the hosting decision and setup.

---

## Eval results

Per `docs/blueprints/wishlist-conversion-blueprint-v2.md` Part E: E1 is the only accuracy measure; E3 is agreement, not validation.

### E1 — Coding accuracy (`evals/gold_set/gold_set_final_frozen.jsonl`, n=137, 136 scored)

**Overall `is_relevant` accuracy: 0.875**

| Category | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| availability_decay | 1.000 | 1.000 | 1.000 | 5 |
| not_relevant | 0.941 | 0.897 | 0.919 | 107 |
| fit_size | 1.000 | 0.667 | 0.800 | 6 |
| quality_trust | 0.833 | 0.714 | 0.769 | 7 |
| price_certainty | 0.667 | 0.545 | 0.600 | 11 |
| occasion_styling / timing_forgetting / bookmark_not_intent / other | — | — | — | 0 (no gold-set coverage) |

This run had 0 classification failures. `price_certainty` recall has moved across three runs (0.4 → 0.5 → 0.545) without fully stabilizing — see Limitations; the most-supported diagnosis (`docs/experiment_manifest.md`) is that most misses reflect the gold label applying a looser "price mentioned" standard than the codebook's own stricter "explicit hesitation" definition, not a classifier defect.

### E3 — Cross-model robustness (agreement, not validation)

⚠️ **PLACEHOLDER — run in progress as this draft is being written.** Will fill in Cohen's κ (Groq `gpt-oss-20b` vs. Ollama `llama3.2:3b`, substituted for the blueprint's `hermes3:8b` per `docs/FAILURES.md` 2026-08-19) once it completes.

### E2, E4, E8 — not yet run

⚠️ **GAP.** E2 (quote fidelity) has no findings to check yet since no downstream report quoting the corpus has been written. E4 (run stability) and E8 (synthetic set + usability test) are not built.

---

## Limitations — stated honestly

- **The frozen Coding Agent has only ever been run against the 137-item gold set, never the full ~2,900-item corpus.** Every prevalence number in this document is either the earlier relevance-only pre-filter (not the full barrier classifier) or the gold-set evaluation itself — not a real barrier-prevalence measurement across the full corpus.
- **Reddit, the reallocation target after Play Store failed viability, was never actually collected.** `data/raw/reddit_manual.jsonl` contains one placeholder row. This is an open task, not a completed pivot (`docs/SESSION_HANDOFF.md`).
- **No single segment/opportunity was chosen via the original kill-criteria process — deliberately, not by omission.** `docs/hypotheses.md` C.2 called for a segment × barrier matrix with one cell picked and defended; `docs/decisions/opportunity-selection.md` documents why criteria 1–2 of C.3 cannot be evaluated (no segment-tagged data, and retroactively tagging the corpus now was rejected on methodology-integrity grounds, not just time) and why forcing a single winner from genuinely multi-barrier evidence would be less rigorous, not more. The MVP's five personas reflect that finding directly.
- **The v2 corpus reclassification itself is incomplete.** The checkpoint that produced the relevance-rate table above stopped intentionally at 2,203/2,921 items (75%) — the rest of Myntra Play Store, all of Nykaa Play Store, and Reddit were never reached (`docs/SESSION_HANDOFF.md`).
- **MVP wishlist/persona data is entirely simulated**, disclosed in-app (`SimulatedDataLabel`) — grounded in the real interviews but not real user accounts or real purchase history.
- **Git commit history has not been scrubbed for anonymity yet** — a personal identity was found on the first 5 commits and fixed going forward, but the existing history rewrite is deliberately deferred to the final compliance sweep, not yet done (`docs/decisions/git-identity-and-history-scrub.md`).
- **E1's `price_certainty` recall has not fully stabilized** across repeated runs (0.4 / 0.5 / 0.545) — small support (n=11) means each run swings by roughly 1/11. Treat the reported number as within that band, not as a single precise figure.
- **4 of 9 barrier/eval categories have zero gold-set coverage** (`occasion_styling`, `timing_forgetting`, `bookmark_not_intent`, `other`) — real per the interviews, but E1 cannot report a precision/recall number for them.

---

## Decisions

Every non-obvious pivot in this project has a dated ADR in `docs/decisions/`, not a buried commit message:

- **[`product-and-source-choice.md`](docs/decisions/product-and-source-choice.md)** — Play Store review density measured and found too thin (<10 usable items/500 for all 3 apps) to serve as primary discovery evidence; reallocated to Reddit/YouTube/Quora, Play Store downgraded to corroboration only.
- **[`reddit-source-choice.md`](docs/decisions/reddit-source-choice.md)** — which 4 subreddits were selected for manual (not PRAW-automated) collection, and why automated verification was abandoned.
- **[`unified-data-schema.md`](docs/decisions/unified-data-schema.md)** — one common schema across all sources (Play Store, Reddit, App Store), so a second source didn't silently diverge from the first.
- **[`git-identity-and-history-scrub.md`](docs/decisions/git-identity-and-history-scrub.md)** — a personal identity found on early commits, fixed going forward, full history rewrite deliberately deferred to the final compliance sweep.
- **[`discovery-engine-hosting.md`](docs/decisions/discovery-engine-hosting.md)** — n8n Cloud (free trial) chosen and confirmed working over a self-hosted tunnel fallback (documented, unused) for the public discovery-engine webhook link.
- **[`opportunity-selection.md`](docs/decisions/opportunity-selection.md)** — why no single segment/opportunity was forced via the original kill-criteria process, and the deck-narrative resolution (availability_decay leads the problem statement; price_certainty stays the flagship MVP case).
