# Decision: Codebook v3 — adding `social_validation` and `comparison_shopping`

**Date:** 2026-09-05.

## What prompted this

A direct re-read of the original project brief's question list against what the discovery engine actually classifies found two questions with no matching category anywhere in the taxonomy:

- "What role do fit, size, styling, price, reviews, occasion **and social validation** play?" — no category captured input from other people (friends, family, influencers, social proof).
- "How do users **compare multiple shortlisted products**?" — `is_relevant`'s own definition has named "comparison-shopping" as in-scope text since v1, but no barrier category ever coded it as its own thing; it silently fell into whichever other category matched first, or `other`.

Both are real gaps, not edge cases — this decision closes them by extending the codebook (`docs/codebook.md` v3) and the frozen Coding Agent prompt (`agents/coding_agent_prompt.md`) to a 9-category taxonomy: the original 7 barriers + `social_validation` + `comparison_shopping` (`other` and `not_relevant` unchanged, so 11 values in the full `primary_barrier` enum).

## What this update does NOT do, and why

**The frozen gold set (`evals/gold_set/gold_set_final_frozen.jsonl`, n=137) was not touched.** Re-labeling it to backfill these two categories would mean editing the set the E1 circularity guard exists specifically to protect (`docs/hypotheses.md`, `docs/experiment_manifest.md` EXP-005/EXP-006) — the project's own rule (`docs/codebook.md`'s original header) is that any codebook change after the gold set is labelled means "re-label from scratch," which is not something to do quietly three categories in, on submission day, without the same rigor (blind double-labeling, project-owner tie-break) the original freeze got.

**E1 and E3 were not re-run.** `evals/e1_results.json` (0.875 accuracy) and `evals/e3_results.json` (κ=0.159) are exactly what they were before this change: real, honestly-reported numbers for the *original* 9-value enum (7 barriers + `other` + `not_relevant`). They are not retroactively reinterpreted as covering the two new categories, and nothing in this repo should be read as claiming they do.

**The Play Store/App Store corpus was not re-classified.** `social_validation` and `comparison_shopping` have exactly the same evaluation status the codebook already uses for `occasion_styling`, `timing_forgetting`, and `bookmark_not_intent` before this change: a real category, grounded in real evidence, with zero corpus positives found because no corpus pass has ever looked for them.

## What evidence actually grounds these two categories

Both are supported by data already in this repo, not invented for this amendment:

- **`social_validation`**: `docs/research-findings.md` Part 1 — 30/32 survey respondents (94%) look outside the app before deciding, and Part 2's H4 evidence explicitly names "friends/family" as one of the external sources consulted, alongside shopping sites and Instagram/YouTube.
- **`comparison_shopping`**: `docs/research-findings.md` Part 1 — "comparing options" is 7/32 (22%) of stated reasons for saving an item, the third-largest reason given.

Neither is a fabricated category chasing a checklist — both were already-collected findings that had nowhere to live in the classification schema.

## What would be needed to actually run these

1. A real classification pass (or a fresh, small hand-labelled holdout — not the frozen 137) so E1-style accuracy/precision/recall can be reported for these two categories the same honest way as the other seven.
2. Given the review corpus's demonstrated blind spot for pre-purchase hesitation language generally (`docs/codebook.md`'s "What this means for the freeze decision" section), expect these two to skew corpus-sparse as well — that would not be a codebook failure, consistent with the existing finding.

This is logged as future work, not silently left undone: flagged here, and in `README.md`'s Limitations section, rather than implied as complete.
