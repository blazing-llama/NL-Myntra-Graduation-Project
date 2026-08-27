# Session Handoff — 2026-08-25 (updated, post-research-findings)

Dense factual state dump for a fresh agent session. Not narrative. Verify anything below against live files before acting on it — this is a snapshot, not a guarantee.

## Resolved: survey/interview discrepancy

The prior version of this doc flagged that "survey n=32" and "6 interviews" were referenced but not found anywhere in the repo. **Resolved 2026-08-25:** the research is real — it happened in a separate Claude.ai conversation with the user and simply hadn't been written into this repo yet. The user provided the full survey summary and all 6 interview transcripts directly; they are now recorded in **`docs/research-findings.md`**, including a confirm/contradict matrix against the corpus and H2's resolution (bookmark_not_intent is real but a minority pattern, ~9% by both interview and survey evidence — most saves reflect genuine deferred intent blocked by a specific barrier, not inflated-denominator noise). Read that file for the actual findings; nothing here is fabricated or estimated.

## Repo structure

```
docs/blueprints/       Read-only reference: 00-03 + v2 strategy blueprint + discovery-engine-webhook.json (source of truth for WHY/HOW)
docs/decisions/        ADRs: git-identity-scrub, product-and-source-choice, reddit-source-choice, unified-data-schema
docs/                  codebook.md (v2, NOT frozen), hypotheses.md (frozen), experiment_manifest.md, FAILURES.md
scrapers/               playstore.py, appstore.py (both live-verified working)
pipeline/               clean.py (source-agnostic), relevance_prefilter.py (v2 prompt, hardened retry logic), run_v2_full_pass.py (checkpointed reclassification), migrate_to_unified_schema.py (historical, already run)
prompts/                versioned prompt library: relevance_prefilter/{v1,v2}.md + CHANGELOG.md
agents/                 relevance_prefilter_prompt.md only. NO coding_agent_prompt.md yet (see gate section)
evals/gold_set/         tranche 1 frozen + labeling exports (see gold-set section)
data/raw/               playstore_{myntra,ajio,nykaa}.json, appstore_{myntra,ajio,nykaa}.json, reddit_manual.jsonl (1 placeholder row only)
data/processed/         clean_*.json per source, relevance_*.json (STALE, pre-v2), relevance_v2_checkpoint.jsonl (live, in-progress), relevance_summary.json (STALE — still v1 Play Store numbers only)
workflows/              discovery-engine-webhook.json — n8n workflow, live-tested, credential-based auth (not env-var)
mvp/                    Vite+React app, deployed to Vercel (see MVP section)
logs/                   run_v2_full_pass_*.log timestamped run logs (gitignored? check — currently untracked)
.n8n-local/             local n8n test instance data, gitignored, not a deliverable
survey/                 questionnaire.md template only — no responses collected
```

## Data pipeline status

**Scraped:**
| Source | Method | Raw count | Verified live |
|---|---|---|---|
| Play Store (NEWEST) | `scrapers/playstore.py`, `google-play-scraper` | 500/app × 3 = 1,500 | ✅ |
| Play Store (RATING asc, new) | `pipeline/run_v2_full_pass.py` phase 1 | 390/394/390 = 1,174 new | ✅ |
| App Store | `scrapers/appstore.py`, Apple's public RSS feed directly (no lib — see FAILURES.md 2026-08-24) | 500/app × 3 = 1,500 | ✅ |
| Reddit | Manual collection, per `docs/decisions/reddit-source-choice.md` (4 subreddits chosen: r/IndianFashionAddicts, r/indianbeautyhauls, r/TwoXIndia, r/india) | **1 placeholder row only — manual collection never completed** | N/A |

**Reddit is NOT "dropped" — it's the reallocation target after Play Store failed the viability gate (EXP-001), subreddits were chosen and logged, but the actual hand-collection step (30–50 items target) was never done.** This is an open task, not a closed decision.

**Cleaned corpus (post `pipeline/clean.py`):** 7 sources — ajio(576, includes new rating-sorted), appstore_ajio(411), appstore_myntra(288), appstore_nykaa(440), myntra(488, includes new), nykaa(180, NOT yet merged with new rating-sorted — check before trusting count), reddit(1). Total ≈ 2,921 (per `run_v2_full_pass.py`'s own count at last run).

**Relevance classification — TWO prompt versions exist, currently mid-reclassification:**
- **v1** (`prompts/relevance_prefilter/v1-2026-08-19.md`): used for the original Play Store viability gate (EXP-001: 2/248 Myntra, 2/185 AJIO, 1/180 Nykaa) and the first two App Store apps (AJIO 3/411=0.7%, Myntra 4/288=1.4%). Nykaa App Store was never completed under v1 (job was killed mid-run when v2 was approved).
- **v2** (`prompts/relevance_prefilter/v2-2026-08-25.md`): adds explicit "save/bookmark for inspiration vs. near-term purchase intent" clause, per an audit against H2 in `docs/hypotheses.md`. **Currently active in `pipeline/relevance_prefilter.py`.** Full corpus reclassification required under v2 for consistency (v1/v2 results cannot be mixed).
- `data/processed/relevance_summary.json` is now **CURRENT as of 2026-08-25**, rebuilt from the checkpoint by `pipeline/finalize_v2_checkpoint.py`. It reflects the final, intentionally-stopped 2,203-item state below — not the full 2,921-item corpus.
- **Final v2 state, from `data/processed/relevance_v2_checkpoint.jsonl`: 2,203 / 2,921 done (75%).** Per-source: ajio 20/576 (3.5%) relevant, appstore_ajio 2/411 (0.5%), appstore_myntra 8/288 (2.8%), appstore_nykaa 5/440 (1.1%), myntra 4/488 (0.8%) — myntra here is only the first 488 of the full 638-item myntra corpus. **Not reached: rest of myntra (150 items), all of nykaa playstore (567 items), reddit (1 item).**
- **Run status: STOPPED — intentional, per explicit user instruction (2026-08-25), not a bug.** The prior framing ("died again," "likely laptop sleep") was wrong; it was told to stop for the same reason coding_agent_prompt.md stays gated — the gold set needed the survey/interview evidence first (see `docs/research-findings.md`) before further corpus work made sense. **Do not resume `pipeline/run_v2_full_pass.py` without asking the user first** — the previous framing of resuming being the "next action" no longer applies.
- Comparison against pre-v2 (EXP-002) numbers: Play Store overall was 8.9% under human blind-labelling (tranche 1, all 3 apps pooled) vs. the original pilot's 0.6–1.1% per-app under v1's minimal prompt. Against v1's automated per-app numbers specifically — AJIO 3/411=0.7%→v2 not yet run on same slice at parity, Myntra App Store 4/288=1.4% (v1) vs. 8/288=2.8% (v2, same 288-item corpus) — **v2 roughly doubled the automated relevant rate on App Store Myntra**, consistent with the v2 prompt's added save/bookmark-vs-purchase-intent clause catching more genuine pre-purchase content. AJIO App Store v2 (2/411=0.5%) is *lower* than v1's automated 0.7% — small-count noise at n≈3 either way, not a reliable signal either direction. Play Store AJIO v2 (20/576=3.5%) is well above the original v1 Play Store pilot's 0.6–1.1% range, but that comparison also includes the new rating-sorted review batch (not in v1's corpus at all), so the prompt-version effect and the corpus-composition effect are confounded there — cannot cleanly attribute the increase to the prompt fix alone on that slice.
- `pipeline/relevance_prefilter.py`'s `classify()` was hardened 2026-08-25: 60s timeout (was 30s), 2 retries with backoff on `ReadTimeout`/`ConnectionError`, never raises — logs unrecoverable items to `data/processed/relevance_v2_skipped.jsonl` (doesn't exist yet — no items have needed it) and continues. This fix was NOT active during the 730-item run; it IS active for anything classified after 2026-08-25 ~19:00 IST.

## Gold-set status

- **Tranche 1: FROZEN.** `evals/gold_set/gold_set_playstore_tranche.jsonl` — 90 items, hand-labelled (blind), Play Store only. Schema: `{id, source, text, relevant, category}`. One row (item 87) has `relevant: null, category: null` — labeler left it blank, flagged, not yet resolved by the user.
  - Result: 8/90 (8.9%) relevant. Categories: price_certainty=4, quality_trust=3, availability_decay=1, **fit_size/occasion_styling/timing_forgetting/bookmark_not_intent = 0** (this is the open question the v2 prompt fix and App Store expansion are trying to resolve).
- **Tranche 2: DRAWN, awaiting user review before labeling.** `evals/sample_gold_set_tranche2.py` pulled all 35 v2-relevant items (not already in tranche 1) across the 5 classified v2 sources: myntra 2, ajio 18, appstore_myntra 8, appstore_ajio 2, appstore_nykaa 5. Output: `evals/gold_set/candidates_tranche2.jsonl` + `candidates_for_labeling_tranche2.csv` (blind CSV, same format as tranche 1) + `item_number_to_id_tranche2.json` (mapping, never shown to labeler). **Do not hand this to the labeler yet — the user needs to review the draw first**, per explicit instruction. No filler not-relevant items were needed; 35 relevant items alone hit the target range.
- Supporting files already in `evals/gold_set/`: `candidates.jsonl` (90 pre-shuffle candidates), `candidates_for_labeling.csv` (blind export, tranche 1), `labeling_handoff.csv` (early plain-text export, superseded by `candidates_for_labeling.csv`), `item_number_to_id.json` (tranche 1 mapping, re-ingestion only, never shown to labeler).

## Hard gate: coding_agent_prompt.md

**`agents/coding_agent_prompt.md` DOES NOT EXIST. Gate has NOT cleared.**

Per project ground rules (repeated explicitly by the user throughout this session): the full gold set must be hand-labelled and frozen — **both tranches, merged into one file** — before this prompt gets written or tuned. Tranche 1 is frozen; tranche 2 isn't drawn yet. **Do not write or tune this file until both tranches exist, are merged, and the user has explicitly confirmed the combined set is frozen.** This has been asked for and respected repeatedly this session — treat it as non-negotiable, not a suggestion.

## MVP status

- **Built:** Vite+React app, `mvp/`. Both locked screens (WishlistHome, ItemDetail) with all 12 Section A requirements from `01_MVP_DESIGN_SPEC.md` verified in-browser at multiple points this session. Theme A ("Warm Humanist & Editorial") structural/interaction treatment applied on top of the locked palette/typefaces (commit `a076c27`) — NOT a palette/typeface swap.
- **Live:** `https://mvp-henna-delta.vercel.app` (stable alias; underlying deployment IDs rotate on redeploy). Deployed via `vercel deploy --prod --yes` from `mvp/`. Vercel account: `sankalp7979-6401`.
- **Product images:** 5 real Unsplash photos, hardcoded CDN URLs (commit `949dc4f`).
- **Supabase event log:** `mvp/supabase/schema.sql` (event_log table, RLS + explicit GRANTs — see FAILURES.md 2026-08-25 for a real gotcha: RLS policy alone is NOT sufficient, needs a paired `GRANT`). Wired into add_to_cart, trace_expand, badge_tap. **Verified live end-to-end (201 Created confirmed via direct REST call matching the app's exact insert shape).** Real credentials are in `mvp/.env` (gitignored) and Vercel production env vars (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, set with `--visibility config --no-sensitive` — required for any `VITE_`-prefixed var on Vercel now).
- **Why Now badge:** `mvp/src/components/WhyNowBadge.tsx` — **DRAFT COPY, not finalized** (commit `4459636`, explicitly labeled as such). No spec for this feature existed anywhere in the docs when built — the badge label, 48h age threshold, and all three fixed-prompt strings ("why resolves now" / "what if I wait" / "why am I seeing this") are placeholders pending user edits. Logic (age gate AND confidence-!=-insufficient gate; stock-based honest scarcity-or-nothing-changes copy) is verified working in-browser; wording is not approved.
- **`mvp/api/narrate.ts`:** stub only, not wired to the frontend yet — real LLM narration layer waits on Phase 5 barrier selection.

## ⚠️ Git status — 4 commits NOT pushed, working tree dirty

```
Local ahead of origin/main by 4 commits:
  4459636 feat: Why Now badge shell -- DRAFT copy, not yet finalized
  5946a7c feat: Supabase event log wiring, verified live end-to-end
  9957341 data: gold-set tranche 1 frozen, blind-labeling exports, EXP-002 update
  36dc8a5 feat: App Store scraper via Apple's public RSS feed; fix: app-store-scraper broke venv deps
```
Push was never explicitly requested for these — do not push without asking.

Working tree currently has uncommitted changes: `pipeline/relevance_prefilter.py` (v2 prompt + retry hardening), new `pipeline/run_v2_full_pass.py`, new `prompts/` dir, in-progress data files (`data/processed/relevance_v2_checkpoint.jsonl`, partial `relevance_appstore_*.json`, modified `clean_*.json`/`playstore_*.json` from the new rating-sorted scrape). **Do not commit the data/processed files until the v2 reclassification run actually completes** — they're mid-run, not a coherent snapshot.

## Phase status (v2 blueprint Part I timeline)

Blueprint gates: Aug 18–20 (source viability) → Aug 21–24 (coding run + Wave 1 interviews) → Aug 25–27 (segment/opportunity chosen) → Aug 26–30 (Wave 2 + MVP) → Sep 1–2 (E8 eval) → Sep 3–4 (deck). **Today is 2026-08-25.**

**Actual state is behind the blueprint's own schedule:**
- Aug 20 gate (source viability): resolved, but the answer was "reallocate" (Play Store <10 threshold) and the reallocation (Reddit) still hasn't produced real data.
- Aug 24 gate ("enough validated evidence to choose an opportunity?"): **not met.** No frozen full gold set (tranche 2 drawn but not labeled/merged), no coding_agent_prompt.md, no full barrier-classification run has ever happened (only relevance-only pre-filtering, twice, under two prompt versions). Interview/survey data now exists and is recorded in `docs/research-findings.md` (see above) — that part of the gap is closed, but it still needs to feed into a merged, frozen gold set before the gate clears.
- MVP shell (nominally an Aug 26–30 deliverable) is already built and deployed — **out of sequence** relative to segment/opportunity selection, which hasn't happened. This was done deliberately (Phase 6 early-scaffold instruction, per `00_IMPLEMENTATION_BLUEPRINT.md`'s own note to deploy early with placeholder data) — not a mistake, but means the MVP's content is still 100% mock/generic until Phase 5 picks a real barrier.

## Immediate next 2–3 actions

1. **User reviews the tranche 2 draw** (`evals/gold_set/candidates_for_labeling_tranche2.csv`, 35 items) before it goes to labeling.
2. Get tranche 2 hand-labelled (blind), same process as tranche 1. Resolve tranche 1's one blank row (item 87) at the same time if possible.
3. Merge tranche 1 + tranche 2 into one frozen gold set, update EXP-002 with final numbers — **only then** write `agents/coding_agent_prompt.md`.
4. Whether to resume `pipeline/run_v2_full_pass.py` for the remaining 718 items (rest of myntra, all of playstore nykaa, reddit) is an open question for the user, not a default next step — the stop was intentional this time.

## Open issues carried forward (from FAILURES.md, still relevant)

- **RLS + GRANT gotcha** (2026-08-25): any future Supabase table needs an explicit `GRANT`, not just an RLS policy — policy alone fails with "permission denied," a different error from an RLS rejection.
- **n8n `$env` access is blocked by default** (2026-08-22): the discovery-engine webhook uses an n8n Credential now, not env-var interpolation — anyone hosting it fresh needs to create a "Groq API Key (Header Auth)" credential matching the placeholder ID in the committed JSON.
- **Never PATCH an active n8n workflow's nodes/connections live** — delete + clean re-import instead (corrupts webhook registration otherwise).
- **Unmaintained PyPI packages can silently break shared venv deps** (`app-store-scraper` downgraded `requests`/`urllib3` project-wide) — check maintenance status before installing anything new into this venv.
- **`relevance_prefilter.py` runs are fragile over multi-hour spans** — silent interruptions (not crashes) have happened twice now on the same run. The retry/timeout hardening addresses transient Ollama timeouts but not whatever is killing the process itself (laptop sleep is the leading suspect, unconfirmed).
