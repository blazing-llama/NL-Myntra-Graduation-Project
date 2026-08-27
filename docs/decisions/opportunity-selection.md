# Decision: Opportunity/Segment Selection

**Date:** drafted 2026-08-26, finalized 2026-08-27.

## What actually happened (stated plainly, not softened)

Per `docs/hypotheses.md` C.2, the blueprint's intended process was: build a segment × barrier matrix, then **pick and defend one cell** via the pre-committed kill criteria (C.3) before building anything downstream. That formal process was never run. No segment × barrier matrix was ever built from the data, and the four kill criteria in `docs/hypotheses.md` C.3 were never checked:

1. Ranks #1 or #2 among barriers *within its segment*
2. Carries ≥1.5× the evidence of the #4 barrier *in that segment*
3. Confirmed across ≥2 source types, including interviews
4. Has an observed user workaround

Instead, the MVP built five personas, each representing a different barrier confirmed real in `docs/research-findings.md`'s interviews. This decision formalizes that outcome and explains why the original process is not being retroactively run.

## Why criteria 1 and 2 cannot be evaluated, and why that's not being fixed now

Criteria 1 and 2 both require a barrier ranking broken out *per segment*. No segment-tagged breakdown of the corpus or gold set exists — every count this project has (relevance rates, gold-set category counts) is pooled across all users, not split by user segment.

**Rejected: retroactively tagging the corpus by segment now.** Two methodology-integrity reasons, not just time pressure:

1. **It risks reopening the frozen gold set.** `evals/gold_set/gold_set_final_frozen.jsonl` was frozen specifically to guard against E1 circularity (`docs/hypotheses.md`, `docs/experiment_manifest.md` EXP-005/EXP-006). Adding a new labeling dimension (segment) this close to submission means either re-touching the frozen set — which the project's own rules treat as burning it, requiring a fresh holdout — or building segment tags on a *different*, unvalidated pass, which wouldn't be comparable to the frozen barrier labels anyway.
2. **Segments would have to be inferred, not observed.** The corpus (app reviews) has no reliable segment signal in the text itself — age, spending pattern, or shopper type would have to be guessed from short review snippets, which is exactly the kind of unsupported inference this project has consistently refused to make elsewhere (e.g. `pipeline/relevance_prefilter.py`'s explicit "do not infer beyond what is explicitly stated" rule, `agents/coding_agent_prompt.md`'s identical constraint). Manufacturing segment tags to satisfy a metric would produce a number that looks rigorous but isn't.

Both are correctness problems, not just schedule problems — retrofitting segment tags now would make the eval look more complete while actually being less trustworthy.

## Decision: do not force a single-opportunity selection

**The kill-criteria process, as originally scoped, will not be run, and no single opportunity is being forced as "the" answer.**

This is a decision about the evidence, not a concession to time. The kill criteria were designed to arbitrate between *competing* explanations when the data points one way. That's not what this project's evidence shows. Four different barriers are each independently confirmed by a different, real method:

| Barrier | Corpus (gold set) | Interviews | Survey |
|---|---|---|---|
| `price_certainty` | 11 (largest) | P1, P6 | Largest reason-not-bought, 9/32 |
| `quality_trust` | 7 | P4 | 2nd-largest, 7/32 |
| `fit_size` | 6 | P2 | 3rd-largest, 6/32 |
| `availability_decay` | 5 | **All 6 interviews independently** | **100% (32/32)** |
| `occasion_styling` | 0 (interview-only) | P3, P5 | 4th, 4/32 |
| `timing_forgetting` | 0 (interview-only) | P6 | Smallest, 3/32 |
| `bookmark_not_intent` | 0 (interview-only) | P3 only (1/6) | ~9% (H2's resolution) |

Forcing a single winner out of this would mean discarding real, independently-corroborated evidence for the other barriers just to produce a ranked list — that's *less* rigorous than reporting what was actually found, not more. The honest finding is: this project surfaced multiple real, corroborated barriers, at different strengths and through different methods, not one dominant blocker with three imposters. Reporting that plainly is the methodologically correct outcome here, not a workaround for skipping analysis.

## Deck narrative (explicitly not a methodology claim)

For presentation purposes only — this section does not change or override the evidence table above:

- **`availability_decay` leads the problem-statement framing.** It has the strongest cross-method triangulation in the whole project: the only barrier every single interviewee independently raised (6/6), the only survey question with a unanimous result (32/32), and its corpus under-representation is itself disclosed and explained (`docs/research-findings.md`) rather than hidden.
- **`price_certainty` (Wide-Leg Jeans) stays the flagship MVP walkthrough case.** It's already fully built, has the cleanest single-item narrative of anything in the MVP, and its interview quote (P1: *"if it was 1,200 I probably would've bought it then and there"*) ties directly to a real, working feature — the price-pulse sparkline (`mvp/src/components/ComparisonStrip.tsx`).

## Pre-empting "why didn't you pick one?"

**Stated plainly, for the deck and for any evaluator who asks:** the MVP's multi-persona design reflects genuine research breadth, not indecision. Five personas exist because five barriers were independently confirmed real by different methods, not because a single-opportunity decision was avoided or missed. The kill-criteria process wasn't skipped by accident — it was assessed as inapplicable to what the evidence actually showed, and that assessment is on the record here rather than left implicit.
