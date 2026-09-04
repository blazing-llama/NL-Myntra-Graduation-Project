# Wishlist Non-Conversion — A Case Study

Fashion-ecommerce wishlists fill up with items that never get bought. This project asks why, with real evidence — a review-corpus discovery engine, a 32-person survey, 6 structured interviews, and a live decision-support MVP that demonstrates the resolution — rather than assuming an answer and building a demo around it.

**Live MVP:** https://mvp-henna-delta.vercel.app
**Live discovery engine (testable):** https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine
**Live discovery engine demo (Streamlit):** https://nl-myntra-graduation-project-naspi2s3gtajwsv79uwe8w.streamlit.app/

Every claim below is sourced from a file in this repo, cited inline. Numbers were checked directly against the underlying data files, not carried over from an earlier draft.

---

## 1. Problem statement

**Metric:** wishlist → purchase conversion within 30 days — the share of users who purchase at least one wishlisted item within 30 days of adding it, per user, window starting at add (`docs/blueprints/wishlist-conversion-blueprint-v2.md` Part B.1).

The blueprint decomposes this multiplicatively:

```
P(purchase ≥1 wishlist item in 30d) ≈ Intent × Availability × Re-encounter × Resolution × Checkout
```

**Price certainty** is tracked as a related but separate factor, deliberately not folded into that product: stock-out (Availability) is a hard block, price hesitation is a soft one, and the two respond to different interventions. The no-money constraint this project ran under blocks most price levers anyway, pushing the real opportunity toward Intent, Re-encounter, and Resolution — a narrowing that's derived from the decomposition, not assumed going in (`docs/blueprints/wishlist-conversion-blueprint-v2.md` Part B.2).

Six hypotheses were frozen before any coding run started (`docs/hypotheses.md`, frozen 2026-08-19):

- **H1** — Non-conversion is primarily unresolved uncertainty, not forgetting.
- **H2** — A material share of adds were never purchase intent (bookmark vs. intent) — the brief's own explicit question, and the highest-leverage hypothesis in the set.
- **H3** — The dominant uncertainty differs by segment.
- **H4** — Users resolve uncertainty outside the app and often don't return.
- **H5** — Availability decay silently kills a share of high-intent saves.
- **H6** — Users prefer explainable output over confident black-box output.

The intended output shape was a segment × barrier matrix with one cell picked and defended (`docs/hypotheses.md` C.2). That formal selection didn't happen — see §5.

---

## 2. Discovery engine architecture

```
scrape (Play Store + App Store)
  → clean / dedupe / PII-scrub
  → relevance pre-filter (is_relevant only)
  → human-labeled gold set
  → coding agent (Groq-hosted, full barrier classification)
  → findings (deterministic aggregation)
```

1. **Scrape.** `scrapers/playstore.py` (`google-play-scraper`) and `scrapers/appstore.py` (Apple's public customer-reviews RSS feed, written after `app-store-scraper` broke the shared venv — `docs/FAILURES.md`, 2026-08-24) pull raw review text into one shared shape (`docs/decisions/unified-data-schema.md`).
2. **Clean.** `pipeline/clean.py` dedupes, drops non-English/too-short text, and PII-scrubs.
3. **Relevance pre-filter.** `pipeline/relevance_prefilter.py` — a minimal, `is_relevant`-only prompt (`agents/relevance_prefilter_prompt.md`), separate from the full classifier — ran against every cleaned item across 5 sources. **2,203 reviews classified** (verified directly against `data/processed/relevance_summary.json`: AJIO Play Store 576, Myntra Play Store 488, AJIO App Store 411, Myntra App Store 288, Nykaa App Store 440 — sums to 2,203). This is a checkpointed run against a planned ~2,921-item corpus, stopped intentionally at 75% once the gold set needed survey/interview evidence first (`docs/SESSION_HANDOFF.md`) — not the full corpus, and not yet resumed.
4. **Human-labeled gold set.** `evals/gold_set/gold_set_final_frozen.jsonl` — **n=137** (verified by direct line count), blind double-labeled on the second tranche with **89.4% raw inter-labeler agreement and 100% category agreement on every item both labelers independently flagged relevant** (`docs/experiment_manifest.md` EXP-005).
5. **Coding agent.** `agents/coding_agent_prompt.md` — the frozen v2 core, full 9-way barrier classifier (`fit_size` / `price_certainty` / `occasion_styling` / `quality_trust` / `availability_decay` / `timing_forgetting` / `bookmark_not_intent` / `other` / `not_relevant`), run via Groq (`openai/gpt-oss-20b`, one retry escalating to `openai/gpt-oss-120b`). **Only ever run against the 137-item gold set for evaluation — never against the full corpus** (see Limitations). A v3 amendment (2026-09-05, `docs/decisions/codebook-v3-amendment.md`) added two more categories — `social_validation`, `comparison_shopping` — to close a real gap against the brief's own question list; **neither has ever been classified against anything** (no corpus pass, no gold-set coverage, E1/E3 unchanged) — see Limitations.
6. **Findings.** `pipeline/stats.py` does all aggregation deterministically in Python; the LLM classifies one item at a time and never computes or asserts a prevalence percentage itself.

The same classification call is also wrapped in a live, public **n8n Cloud** webhook — **directly testable**, not just described:

```
https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine
```

```bash
curl -X POST https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine \
  -H "Content-Type: application/json" \
  -d '{"text": "I saved these jeans but I am waiting for the price to drop before I buy them"}'
```

Verified 2026-08-27 by direct POST against the production URL (not just import success) — real classification, not-relevant classification, and the missing-text 400 error path all confirmed correct (`docs/decisions/discovery-engine-hosting.md`).

---

## 3. Research summary

**Survey:** n=32 Google Form responses. **Interviews:** 6, two waves (Person 1–3 exploratory, Person 4–6 targeted) (`docs/research-findings.md`).

Headline survey numbers:
- Why saved: plan to buy soon 11/32, liked but unsure 11/32, comparing options 7/32, browsing/inspiration only 3/32.
- Biggest reason not bought: price uncertainty 9, quality doubt 7, fit doubt 6, occasion fit 4, forgot 3.
- **30/32 (94%)** look outside the app before deciding; only 2/32 decide app-only — direct support for H4.
- **32/32 (100%)** have had a wishlisted item go out of stock/sold out in their size before deciding — the single most unanimous finding in the project.
- Size-prediction trust: 19/32 "trust but would double-check" — the largest group, neither blind trust nor distrust.

The full confirm/contradict matrix — each barrier category against its interview evidence, its corpus status, and a verdict — is documented in `docs/research-findings.md` Part 2 and isn't re-derived here; that file is the source of record for it.

---

## 4. Key finding: corpus-vs-interview divergence

Of the 9 categories in the frozen gold set (`docs/experiment_manifest.md` EXP-005), only **4 have any corpus coverage at all**: `price_certainty`=11, `quality_trust`=7, `fit_size`=6, `availability_decay`=5. The other three barrier categories sit at **zero**: `occasion_styling`=0, `timing_forgetting`=0, `bookmark_not_intent`=0 (`other`=0 too, but that's an expected catch-all). Two further categories, `social_validation` and `comparison_shopping`, were added to the codebook after this gold set was frozen (v3 amendment, `docs/decisions/codebook-v3-amendment.md`) and aren't part of this count at all — not zero-coverage, genuinely never evaluated.

Earlier keyword-scan work on the pre-gold-set corpus sharpens this further (`docs/experiment_manifest.md` EXP-002): only **2 of 7 codebook categories** — `quality_trust` and `availability_decay` — ever produced a *clean* positive example anywhere in the Play Store corpus. The other 5 — `fit_size`, `price_certainty`, `occasion_styling`, `timing_forgetting`, and `bookmark_not_intent` (the last only a borderline case) — had zero clean positives at that stage (`price_certainty` later gained gold-set coverage through App Store data and human labeling — see the gold-set counts above).

Every one of those corpus-sparse-or-zero categories is independently **interview-confirmed as real** (`docs/research-findings.md` Part 4):
- `fit_size` — P2, P5.
- `price_certainty` — P1, P6 (and the single largest reason-not-bought in the survey, 9/32, despite thin corpus coverage).
- `occasion_styling` — P3, P5.
- `timing_forgetting` — P6, explicitly distinguished from deliberate deferral.
- `bookmark_not_intent` (H2) — P3 only, ~9% by survey — real but a minority pattern, not the dominant explanation H2 originally floated.

The interpretation, on record in `docs/research-findings.md`: app-review text structurally under-counts pre-purchase hesitation because of what makes someone write a review at all — a corpus-methodology limitation, not evidence the categories aren't real.

---

## 5. Opportunity selection

Read in full: [`docs/decisions/opportunity-selection.md`](docs/decisions/opportunity-selection.md).

The blueprint's intended process (`docs/hypotheses.md` C.2–C.3) was to build a segment × barrier matrix and pick/defend one cell against four pre-committed kill criteria. **That process was not run** — stated plainly, not softened.

**Why not, at corpus scale:** criteria 1–2 both require a per-segment barrier ranking, and no segment-tagged breakdown of the corpus or gold set exists. Retroactively tagging the corpus by segment was rejected on two methodology-integrity grounds, not just time pressure: it would risk reopening the frozen gold set (burning the E1 circularity guard), and segments would have to be *inferred* from short review snippets rather than observed — exactly the kind of unsupported inference this project's own prompts (`pipeline/relevance_prefilter.py`, `agents/coding_agent_prompt.md`) explicitly refuse to make.

**A real segment × barrier matrix does exist, at interview scale** (`docs/decisions/opportunity-selection.md`, 2026-09-05 addendum): each of the 6 interviewees' segment is *known*, not inferred — a real conversation, not a guessed corpus snippet — so the objection above doesn't apply there. That 6-row matrix shows `availability_decay` as the only barrier every single person hit, and no other barrier shared by more than 2 people — real evidence that behavior genuinely differs person-to-person, at a sample size too small to support a stronger claim than that.

**The deeper reason:** the evidence itself doesn't point to one dominant barrier. Four are each independently confirmed by a different method — `price_certainty` (largest gold-set count, P1/P6, largest survey reason), `quality_trust` (P4, 2nd-largest survey reason), `fit_size` (P2, 3rd-largest survey reason), `availability_decay` (all 6 interviews, 100% survey). Forcing a single winner would mean discarding real, corroborated evidence for the other three just to produce a ranked list.

**Deck-narrative resolution** (presentation choice, not a methodology claim):
- **`availability_decay` leads the problem-statement framing** — the strongest cross-method triangulation in the project (6/6 interviews, 32/32 survey, and its own corpus under-representation is disclosed rather than hidden).
- **`price_certainty` (Wide-Leg Jeans) stays the flagship MVP walkthrough** — already fully built, the cleanest single-item narrative, and its interview quote (P1: *"if it was 1,200 I probably would've bought it then and there"*) ties directly to a real working feature, the price-history comparison strip.

The MVP's five personas reflect this directly: five real, differently-confirmed barriers, not indecision about picking one.

---

## 6. Live MVP

**https://mvp-henna-delta.vercel.app** — React + Vite, deployed on Vercel, Supabase-backed event logging. No real checkout, no auth — a decision-support demo, not a storefront.

**Current flow** (verified against `mvp/src/screens/` and `mvp/src/components/` directly, not older docs):

**Persona Picker** (`PersonaPicker.tsx`) → **Wishlist Intelligence** (`WishlistHome.tsx`) → **Item Detail** (`ItemDetail.tsx`), which surfaces the **Decision Check** widget (`DecisionCheck.tsx` — tabs: "Why now" / "If you wait" / "Evidence") → **Cart** (`CartView.tsx`, persona-scoped). Secondary/reachable-anytime: **Compare Similar** (`CompareSimilarSheet.tsx`) and **Alternatives** (`Alternatives.tsx`, with `AlternativeCompareSheet.tsx`).

**Wishlist Intelligence** buckets each persona's items into *Ready to decide*, *Holding steady* (confidence still thin, but the price itself has genuinely settled — a distinct state from "needs more evidence"), *Needs more evidence*, and *Out of stock* (with a bulk-remove control). It also exposes real **category chips** (one per unique category in that persona's wishlist, e.g. Jeans/Sneakers/Tees) that filter the visible list. **Item Detail**'s price panel shows the current price against a `TYPICAL PRICE` comparison row (steady / down / up, struck-through original price when it moved) rather than a single bare number.

**Five personas**, each a different interview-confirmed barrier, all reachable from the picker (`mvp/mock-data/personas.ts`):

| Persona | Barrier |
|---|---|
| Price-Timing Waiter *(flagship demo)* | Waiting for a specific price |
| Fit-Cautious Returner | Sizing uncertainty, avoids buy-two-sizes-and-return |
| Occasion-Driven Saver | Purchase gated on a real event materializing |
| Quality-Evidence Seeker | Wants a synthesized quality verdict, not raw reviews |
| Inspiration / Moodboard Saver | Genuinely not near-term purchase intent (H2's minority case) |

All wishlist/persona data is simulated, disclosed in-app (`SimulatedDataLabel.tsx`) — grounded in the real interview quotes but not real accounts or purchase history. The MVP's reasoning (confidence levels, Decision Check copy) is templated from that mock data, not live-inferenced against a model at request time — the deterministic-core-then-narration pattern the architecture doc describes, demonstrated on fixed data rather than wired to the discovery engine.

### Discovery engine demo (Streamlit)

**https://nl-myntra-graduation-project-naspi2s3gtajwsv79uwe8w.streamlit.app/** — `discovery_engine_demo/app.py`, a thin single-page UI over the same live n8n webhook from §2 (no separate model call, no mocked response). Three parts, top to bottom:

1. **Corpus at a glance** — stat cards for reviews classified (2,203), gold-set size and inter-labeler agreement (n=137, 89.4%), and E1 classifier accuracy (87.5%), plus a bar chart of gold-set barrier counts. Every number here is pulled directly from `data/processed/relevance_summary.json` and `docs/experiment_manifest.md` (EXP-005/EXP-006) — nothing estimated.
2. **What people actually said** — 6 verbatim interview quotes with persona/context and a "what this means" line, both reproduced as-is from `docs/research-findings.md` Part 2, not paraphrased or newly interpreted.
3. **Metric framework** — the North Star / MVP leading indicators / guardrail definitions, mirroring deck slide 9 exactly (`docs/deck-build/build.js`). Definitions and rationale only — no numbers, since none of these are actually instrumented anywhere in this project yet.

Below that, the original classify flow: paste or pick a gold-set example, POST it to the live webhook, see the real relevance/barrier/confidence response. No chat or free-text agent interface — exactly the 3 fixed fields the webhook returns, plus two optional ones.

---

## 7. Evals — the trust section

Per `docs/blueprints/wishlist-conversion-blueprint-v2.md` Part E: E1 is the only accuracy measure; E3 is agreement between two models, not validation of either.

### E1 — Coding accuracy

`evals/gold_set/gold_set_final_frozen.jsonl`, **n=137** (1 unresolved-null item excluded, **136 scored**). Frozen prompt, never tuned against this set (E1 circularity guard). **Inter-labeler agreement on the set itself: 89.4% raw, 100% category agreement on jointly-flagged-relevant items** (`docs/experiment_manifest.md` EXP-005).

**Overall `is_relevant` accuracy: 0.875** (verified directly against `evals/e1_results.json`).

| Category | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| availability_decay | 1.000 | 1.000 | 1.000 | 5 |
| not_relevant | 0.941 | 0.897 | 0.919 | 107 |
| fit_size | 1.000 | 0.667 | 0.800 | 6 |
| quality_trust | 0.833 | 0.714 | 0.769 | 7 |
| price_certainty | 0.667 | 0.545 | 0.600 | 11 |
| occasion_styling / timing_forgetting / bookmark_not_intent / other | — | — | — | 0 (no gold-set coverage) |

Zero classification failures on this run. `price_certainty` recall has moved 0.4 → 0.5 → 0.545 across three diagnostic re-runs without fully stabilizing (small support, n=11 — each run swings by roughly 1/11) — not re-run further to chase a higher number, per the circularity guard.

### E3 — Cross-model robustness (agreement, not validation)

Model A: `openai/gpt-oss-20b` (Groq). Model B: `llama3.2:3b` (Ollama, local — substituted for the blueprint's `hermes3:8b`, which never finished pulling in this environment, `docs/FAILURES.md` 2026-08-19). Same frozen prompt, same 136-item scored set.

**Raw agreement (primary_barrier): 0.301. Cohen's κ (primary_barrier): 0.159. Cohen's κ (is_relevant): 0.222.** (Verified directly against `evals/e3_results.json`.) By conventional bands that's "slight" agreement on the full 9-way classification and "fair" on the binary relevance call. This is reported as a real limitation of the substitute local model, not smoothed into a robustness claim — it does **not** cast doubt on E1's accuracy, which is measured against human gold labels, not against Model B.

### E2, E4, E8 — not run

Confirmed still accurate (no later entry in `docs/experiment_manifest.md` or `docs/FAILURES.md` supersedes this): **E2** (quote fidelity) has nothing to check yet since no downstream report quoting the corpus has been written. **E4** (run stability) and **E8** (synthetic set + usability test) were never built.

---

## 8. Limitations — stated honestly

- **The frozen coding agent has only ever been run against the 137-item gold set, never the full corpus.** Every prevalence number in this document is either the earlier relevance-only pre-filter (2,203 items, a different and simpler `is_relevant`-only script) or the gold-set evaluation itself — not a real barrier-prevalence measurement across the full corpus.
- **The corpus reclassification itself is incomplete.** Checkpointed intentionally at 2,203/2,921 items (75%) — the rest of Myntra Play Store, all of Nykaa Play Store, and Reddit were never reached (`docs/SESSION_HANDOFF.md`).
- **Reddit was never actually collected.** `data/raw/reddit_manual.jsonl` contains one placeholder row. This is an open task, not a completed pivot — four subreddits were confirmed real by manual web search (`docs/decisions/reddit-source-choice.md`), but the planned 30–50-post hand-curated pull didn't happen.
- **No single segment/opportunity was chosen via the original kill-criteria process — deliberately, not by omission.** See §5 and `docs/decisions/opportunity-selection.md` in full. A real segment × barrier matrix exists at interview scale (6 people, `docs/decisions/opportunity-selection.md`'s 2026-09-05 addendum) but not at corpus scale — the sample is too small to support anything beyond "each person's barrier profile genuinely differs," not a per-segment ranking.
- **E1's `price_certainty` recall has not fully stabilized** (0.4 / 0.5 / 0.545 across three runs) — small support (n=11) means real run-to-run swing, not a stable point estimate.
- **4 of 9 (v2 core) barrier categories have zero gold-set coverage** (`occasion_styling`, `timing_forgetting`, `bookmark_not_intent`, `other`) — real per the interviews, but E1 cannot report precision/recall for them.
- **`social_validation` and `comparison_shopping` (v3 amendment, 2026-09-05, `docs/decisions/codebook-v3-amendment.md`) have never been classified against anything at all** — no corpus pass, no gold-set labels, not part of E1 or E3. Both are grounded in real, already-collected survey evidence (94% look outside the app before deciding; 22% cite "comparing options" as a save reason), but that's the extent of what backs them today.
- **E3's local substitute model (`llama3.2:3b`) is a real, meaningfully weaker stand-in** for the blueprint's intended `hermes3:8b` — the low κ is best read as a comment on that substitution, interpretable against E1's much higher, human-anchored accuracy rather than as a standalone robustness verdict.
- **E2, E4, and E8 were not run** — see §7.
- **MVP wishlist/persona data is entirely simulated**, disclosed in-app — grounded in the real interviews, not real user accounts. Its Decision Check reasoning is templated from that mock data, not a live model call at request time.
- **Git commit history has not been scrubbed for anonymity yet.** A personal identity was found on the first 5 commits and fixed going forward (project-scoped git config); the history rewrite itself is deliberately deferred to the final compliance sweep, not done yet (`docs/decisions/git-identity-and-history-scrub.md`).

---

## 9. Decisions

Every non-obvious pivot has a dated ADR in `docs/decisions/`, not a buried commit message:

- **[`product-and-source-choice.md`](docs/decisions/product-and-source-choice.md)** — Play Store review density measured (2/248, 2/185, 1/180 relevant across the three candidate apps) and found too thin for any of them to serve as a primary discovery source; downgraded to background/corroboration, reallocated to Reddit/YouTube/Quora.
- **[`reddit-source-choice.md`](docs/decisions/reddit-source-choice.md)** — which 4 subreddits were selected for manual (not PRAW-automated) collection, after Reddit blocked unauthenticated JSON access, and why automated verification was abandoned in favor of user-confirmed existence.
- **[`unified-data-schema.md`](docs/decisions/unified-data-schema.md)** — one common record schema across every source (Play Store, Reddit, App Store), so a second source didn't silently diverge from the first; already-collected data was migrated in place rather than re-scraped, to avoid invalidating an already-written decision.
- **[`git-identity-and-history-scrub.md`](docs/decisions/git-identity-and-history-scrub.md)** — a personal identity found on the first 5 commits, fixed going forward via project-scoped git config, full history rewrite deliberately deferred to the final compliance sweep.
- **[`discovery-engine-hosting.md`](docs/decisions/discovery-engine-hosting.md)** — n8n Cloud (free trial) chosen and confirmed working end-to-end for the public discovery-engine webhook, over a documented-but-unused tunnel fallback.
- **[`opportunity-selection.md`](docs/decisions/opportunity-selection.md)** — why no single segment/opportunity was forced via the original kill-criteria process, and the deck-narrative resolution (`availability_decay` leads the problem statement; `price_certainty` stays the flagship MVP case). See §5. Its 2026-09-05 addendum adds the real interview-level segment × barrier matrix.
- **[`codebook-v3-amendment.md`](docs/decisions/codebook-v3-amendment.md)** — why `social_validation` and `comparison_shopping` were added to the codebook after the gold set was frozen, what evidence grounds them, and exactly what was and wasn't re-run (nothing was).

---

## 10. Repo structure

```
scrapers/       Play Store + App Store collectors, unified-schema output
pipeline/       clean → relevance pre-filter → coding agent → stats
agents/         frozen prompts (coding agent, relevance pre-filter)
prompts/        relevance pre-filter prompt version + changelog
data/raw/       source-tier data per app/subreddit
data/processed/ cleaned + relevance-classified data, relevance_summary.json
evals/          E1/E3 scripts + results, frozen gold set, unit tests
workflows/      discovery-engine-webhook.json (n8n)
survey/         Google Form questionnaire
mvp/            React + Vite decision-support demo (src/, mock-data/, supabase/)
discovery_engine_demo/  Streamlit demo over the live n8n webhook (app.py)
docs/
  decisions/    dated ADRs — see §9
  blueprints/   the original project brief and derived specs
  deck/         slide deck (pptx/pdf)
  hypotheses.md, research-findings.md, experiment_manifest.md, codebook.md,
  FAILURES.md, SESSION_HANDOFF.md
```
