# Session Handoff — 2026-08-28

Dense factual state dump for continuity. Not narrative. Every claim below was verified directly against a live file or a live URL in this session — not transcribed from memory or from an earlier stale version of this doc. The previous version (dated 2026-08-25) was badly out of date by the time this was written; treat it as historical only.

## Data pipeline status

- **v2 corpus reclassification: checkpointed, stopped intentionally at 2,203/2,921 items (75%).** Not a bug, not stalled — stopped on explicit instruction because the gold set needed the survey/interview evidence first. `data/processed/relevance_v2_checkpoint.jsonl` + rebuilt per-source `relevance_*.json` + `relevance_summary.json` reflect this final 2,203-item state, via `pipeline/finalize_v2_checkpoint.py`. Not reached: rest of Myntra Play Store (150 items), all of Nykaa Play Store (567), Reddit (1). Resuming this is still an open question for the user, not a default next action.
- **Reddit:** 1 placeholder row only (`data/raw/reddit_manual.jsonl`). Per the deck (`docs/deck/NL Myntra.pptx`, slide 2), this is now framed as a disclosed scope decision — Reddit's Responsible Builder Policy requires a formal researcher program with a timeline this project's window couldn't accommodate — not silently dropped.

## Primary research — logged

`docs/research-findings.md`: survey (n=32) + 6 interview transcripts, reviewed with the user in a separate conversation and logged here in full, including the confirm/contradict matrix against the corpus and H2's resolution (`bookmark_not_intent` real but a minority pattern, ~9%).

## Gold set — FROZEN, n=137

`evals/gold_set/gold_set_final_frozen.jsonl`. Tranche 1 (90, Play Store) + tranche 2 (47, double-labeled — 89.4% raw agreement, 100% category agreement on jointly-flagged-relevant items, 5 disagreements tie-broken by the user) merged via `evals/merge_gold_set.py`. 29 relevant / 107 not-relevant / 1 unresolved-null (tranche 1's item 87, carried forward, never fixed). Category breakdown: `price_certainty`=11, `quality_trust`=7, `fit_size`=6, `availability_decay`=5, **`occasion_styling`/`timing_forgetting`/`bookmark_not_intent`=0** — real per interviews (`docs/research-findings.md`), not gold-set coverage gaps to close.

## Coding Agent — gate cleared, prompt written

`agents/coding_agent_prompt.md` exists, frozen, matches `docs/codebook.md` (also now frozen). **Only ever run against the 137-item gold set for evaluation — never against the full ~2,900-item corpus.**

## Evals — E1 and E3 both run, logged as EXP-006/EXP-007 in `docs/experiment_manifest.md`

- **E1 (`evals/e1_gold_set_eval.py`): overall `is_relevant` accuracy 0.875**, n=136 scored (1 null excluded), 0 classification failures on the final clean run. Per-category: `availability_decay` P/R/F1 = 1.000/1.000/1.000 (n=5); `not_relevant` = 0.941/0.897/0.919 (n=107); `fit_size` = 1.000/0.667/0.800 (n=6); `quality_trust` = 0.833/0.714/0.769 (n=7); `price_certainty` = 0.667/0.545/0.600 (n=11, recall moved 0.4→0.5→0.545 across 3 runs — small-sample noise, not a trend). Other 3 categories: no gold-set coverage, not scored.
- **E3 (`evals/e3_cross_model_agreement.py`): Cohen's κ = 0.159 (primary_barrier), 0.222 (is_relevant), raw agreement 0.301.** Groq `openai/gpt-oss-20b` vs. local Ollama `llama3.2:3b` (substituted for the blueprint's `hermes3:8b`, which never pulled successfully — `docs/FAILURES.md` 2026-08-19). Logged as a real limitation of the smaller local backup model, not smoothed into a robustness claim — the deck states this explicitly (slide 8).

## MVP — 5-screen app, two build rounds + QA + bloat audit, deployed and locked

**Live:** https://mvp-henna-delta.vercel.app

Screens: `PersonaPicker` (two-step: title grid → info panel with real barrier/quote/honest sourcing line → explicit "View wishlist" action, no auto-route), `WishlistHome` (asymmetric editorial grid, category chips, out-of-stock section with bulk remove, similar-items bottom sheet that never dead-ends), `ItemDetail` (3 confidence states always icon+color+label, price-pulse sparkline where price is part of the reasoning, `AITraceWidget`), `CartView` (persona-scoped, explicitly labeled as such).

Build history in this repo (commits, all pushed — see Git status below): v2 corpus data → research findings → gold set freeze + Coding Agent + E1/E3 → MVP product imagery (30 images) → MVP full build (persona picker, grid, trace widget, cart, QA fixes: jargon removed from persona panel, singleton-category "Similar items" hidden rather than dead-ending, out-of-stock checkbox given real visual affordance, "Unendorsed" replaced with plain language, jeans/necklace evidence-accuracy correction) → docs (README case study, opportunity-selection ADR, discovery-engine-hosting ADR).

**Bloat audit run 2026-08-27:** no dead code, no unused npm deps, no oversized images (all 30 product images already correctly sized, 190–320px wide), no stray/debug files. Nothing deleted, nothing to redeploy for.

**Full regression pass, all 5 personas, verified directly on the production URL** (not local) after every round — zero console errors on the final pass.

## Discovery engine — public, live, verified

`workflows/discovery-engine-webhook.json` deployed to n8n Cloud (free trial — `docs/decisions/discovery-engine-hosting.md`). **Public webhook, verified working 2026-08-27 by direct POST, independently re-verified (not just taking the report at face value):**

```
https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine
```

Real classification → 200 + correct `primary_barrier`; not-relevant text → 200 + `is_relevant:false`; missing-text → 400 + correct error. A documented (unexecuted) tunnel fallback exists in the same ADR in case the Cloud instance ever needs replacing.

## Deck — exists, verified 2026-08-28, matches project reality

`docs/deck/NL Myntra.pptx` + `NL Myntra.pdf` (built in a separate Claude.ai session, not this repo — added here 2026-08-28). Verified directly, not taken on claim:

- **10 slides / 10 pages** — confirmed independently both ways (pptx: 10 slide XML files inside the archive; pdf: 10 form-feed page breaks in extracted text).
- **No fellow's name found** — checked 3 ways: raw content grep across all extracted pptx XML, `docProps/core.xml` metadata (creator/lastModifiedBy both say generic "PptxGenJS", no personal name), and `pdftotext` extraction of the PDF. Also checked for any email pattern and the known personal surname — none found.
- **File sizes:** pptx 262,677 bytes, pdf 177,055 bytes — both trivially well under the 40MB limit.
- **Both extract/open cleanly** — pptx unzips without error, pdftotext extracts without error.
- **Content spot-check:** the numbers in the deck (2,203 reviews classified, n=137 gold set, 0.875 E1 accuracy, κ=0.159, the real P1 interview quote on the Wide-Leg Jeans flagship slide, both live URLs) all match what's independently verifiable elsewhere in this repo — not fabricated slide content.
- **Not yet committed to git** — currently untracked (`docs/deck/` shows as `??` in `git status`). Needs a commit + push if it should be part of the pushed repo state.

## Git status — clean except the new deck files

All prior work is committed and pushed: **10 commits, local HEAD == `origin/main`** (`0a704e5...`, verified via `git fetch` + hash comparison, re-confirmed 2026-08-28). Working tree was fully clean before the deck files were added this session; the only current diff is `docs/deck/` (untracked, not yet committed).

## Open items carried forward

- Whether to resume `pipeline/run_v2_full_pass.py` for the remaining 25% of the corpus — still an open question for the user, not a default next step.
- Tranche 1's item 87 (`relevant: null`) — still unresolved, never fixed.
- `mvp/api/narrate.ts` — still a documented stub, not wired to the frontend; real LLM narration layer was deliberately deferred (deck slide 10 discloses this openly: "demo reasoning is templated").
- `docs/deck/` needs committing if it should be part of the tracked/pushed repo state.

## Known gotchas (still relevant, from `docs/FAILURES.md`)

- RLS + GRANT: any new Supabase table needs an explicit `GRANT`, not just an RLS policy.
- n8n: never PATCH an active workflow's nodes/connections live — delete + clean re-import instead.
- Unmaintained PyPI packages can silently break shared venv deps — check before installing anything new.
- This session's Browser-pane tooling has had two known quirks: synthetic `computer` clicks occasionally fail to register (native `.click()` via `javascript_tool` is the reliable fallback), and Vite's dev-server HMR can leave a stale/broken module graph after deleting files mid-session (a clean server restart + fresh browser tab resolves it — confirmed a "syntax error" this way was stale, not real, more than once).
