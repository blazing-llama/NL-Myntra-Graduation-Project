# Coding Agent Prompt — FROZEN

**Gate cleared 2026-08-25.** Per project ground rules, this file could not be written or tuned until the full gold set (both tranches, hand-labelled, merged) existed and was frozen. That happened in EXP-005 (`docs/experiment_manifest.md`): `evals/gold_set/gold_set_final_frozen.jsonl`, n=137 (90 tranche 1 + 47 tranche 2), 29 relevant / 107 not-relevant / 1 unresolved-null carried over from tranche 1 (item 87, still blank — not fixed here, flagged for the user).

**E1 circularity guard (non-negotiable, per `docs/hypotheses.md` and the v2 blueprint's own risk table):** this prompt must never be tuned against `gold_set_final_frozen.jsonl`. It is evaluated against that set exactly once to produce the reported E1 accuracy/precision/recall/F1. If the prompt needs to change after seeing that result, the set is burned — a fresh holdout must be drawn and labelled, and the change logged in `docs/FAILURES.md` or `docs/decisions/`, not silently re-run against the same set until the number looks good.

Base spec: `docs/blueprints/02_AGENT_ORCHESTRATION.md`, "Agent 1: Coding Agent" section. This file is that section's system prompt, reproduced verbatim (unchanged from the blueprint — no drift), plus the run/eval wiring the blueprint left as a sketch.

---

## System prompt (frozen — must match `docs/codebook.md`'s category definitions exactly)

```
You are the Coding Agent for a wishlist-to-purchase conversion research
project. You classify short user-generated text (app review, Reddit
comment, or interview excerpt) about online fashion shopping. Apply ONLY
the codebook below. Do not infer beyond what is explicitly stated.

Return ONLY a single JSON object matching this exact schema, no other text:

{
  "evidence_id": string,
  "is_relevant": boolean,
  "primary_barrier": one of [
    "fit_size", "price_certainty", "occasion_styling", "quality_trust",
    "availability_decay", "timing_forgetting", "bookmark_not_intent",
    "other", "not_relevant"
  ],
  "inferred_segment": string or null,
  "workaround_observed": string or null,
  "confidence_score": number between 0 and 1
}

CODEBOOK (provisional — freeze the final version in docs/codebook.md
before the production coding run; this prompt must be updated to match
exactly if the codebook changes):

fit_size = TRUE only if the text explicitly expresses uncertainty about
how a garment will fit or what size to order. Do NOT use for general
appearance comments, or for post-purchase return complaints with no
size-uncertainty language.

price_certainty = TRUE only if the text expresses hesitation tied to
whether the price is fair, or whether to wait for it to drop. Do NOT use
for a simple statement that something is expensive with no hesitation
framing attached.

occasion_styling = TRUE if the text expresses uncertainty about whether
an item suits an occasion, or how to style/wear it.

quality_trust = TRUE if the text expresses doubt about material quality,
brand trust, or whether the product will match its listing.

availability_decay = TRUE if the text describes an item going out of
stock, out of size, or a price changing before a decision was made.

timing_forgetting = TRUE if the text describes simply forgetting about
a saved item, with no specific uncertainty named.

bookmark_not_intent = TRUE if the text indicates the save was for
inspiration, styling ideas, or later browsing rather than a near-term
purchase plan.

is_relevant = TRUE only if the text discusses pre-purchase hesitation,
wishlist/save behaviour, or comparison-shopping. Delivery complaints,
refund-processing-time complaints, and app-crash complaints with no
purchase-decision content are is_relevant = FALSE.

If uncertain, set is_relevant = TRUE, primary_barrier = "other", and
confidence_score below 0.5 rather than forcing a category.
```

**Note on `docs/codebook.md`'s own freeze status:** the codebook file itself is still marked "not frozen" as of this writing, because 3 of 7 categories (`occasion_styling`, `timing_forgetting`, `bookmark_not_intent`) have zero corpus positive examples. `docs/research-findings.md` (survey + 6 interviews) is now the documented explanation for that — those three categories are real (interview-confirmed) but structurally invisible to review-corpus text, not missing from the taxonomy. This prompt does not wait on that file's own header being edited to say "frozen"; the gate that actually blocked this file was the gold set, which is now merged and frozen (EXP-005). If the user wants `docs/codebook.md`'s status line updated to reflect this closure, that's a separate, smaller edit — flagged, not done here.

## What this agent must never do

Compute a percentage, compare across reviews, or make claims about prevalence. It labels one item. Python counts (`pipeline/stats.py` — does not exist yet, needed before the production coding run).

## Model

`openai/gpt-oss-20b` via Groq, temperature 0. On failure/timeout, one retry escalating to `openai/gpt-oss-120b` (matches the n8n workflow's existing retry structure in `workflows/discovery-engine-webhook.json`, `Groq: Classify` → `Groq: Classify Retry`). Hard 15-second timeout per call, per the blueprint's loop/cost-prevention rules. After the retry fails, log `insufficient_evidence` and move on — never block the batch on one item (same never-raises design as `pipeline/relevance_prefilter.py`'s `classify()`).

## Evaluation set for E1–E4

**`evals/gold_set/gold_set_final_frozen.jsonl`** (n=137) is the frozen evaluation set for all four evals below. Schema: `{id, source, text, relevant, category}` — note this is the *relevance pre-filter's* schema (binary `relevant` + a single `category` string), not the Coding Agent's own richer output schema (`is_relevant`, `primary_barrier`, `inferred_segment`, `workaround_observed`, `confidence_score`). E1 scoring compares `relevant`→`is_relevant` and `category`→`primary_barrier` only; `inferred_segment` and `workaround_observed` are not scored against this gold set (no ground truth exists for them) and should be spot-checked qualitatively instead.

- **E1 — Coding accuracy (the spine).** Run the frozen prompt above against all 137 gold-set items. Report accuracy, precision, recall, F1 **per code** (all 8 values in `primary_barrier`'s enum, including `not_relevant`), plus overall `is_relevant` accuracy. **Categories with zero gold-set examples (`occasion_styling`, `timing_forgetting`, `bookmark_not_intent`) cannot get a real precision/recall score — report them as "no gold-set coverage," not as 0% or N/A silently.** Report the actual number, however it lands — per `docs/blueprints/wishlist-conversion-blueprint-v2.md`: "0.72 honestly reported beats 0.85 fabricated."
- **E2 — Quote fidelity.** Exact/normalised substring match of every quoted item in any downstream report against the raw corpus (`data/processed/clean_*.json` / `relevance_*.json`). Auto-discard non-matches. Target 0% hallucinated quotes.
- **E3 — Cross-model robustness (not validation).** Run the same frozen prompt against a 200-item sample with `openai/gpt-oss-20b` (Groq) and a genuinely distinct second model (blueprint calls for `hermes3:8b` via Ollama — still unresolved per `docs/FAILURES.md` 2026-08-19; needs a working substitute before this eval can run). Compute Cohen's κ. **Label the result "cross-model agreement / robustness," never "validation"** — agreement tells you the models agree, not that either is correct. E1 remains the only accuracy measure.
- **E4 — Run stability.** Same corpus, 3 runs at temperature 0 → rank-order agreement of top barriers. If #1 changes between runs, the finding is not robust and that gets stated plainly, not smoothed over.

## Not yet built (needed before the production coding run, out of scope for this file)

- `pipeline/stats.py` — counts/aggregates Coding Agent output; the agent itself must never self-report prevalence.
- `evals/e1_gold_set_eval.py` — runs the frozen prompt against `gold_set_final_frozen.jsonl` and computes the E1 metrics above.
- `evals/e3_cross_model_agreement.py` — referenced in `02_AGENT_ORCHESTRATION.md`, not yet written.
- Content-hash caching before any classification call (blueprint §4) — not yet implemented; matters once the full ~2,900-item corpus runs through this prompt, given how much boilerplate fashion app reviews contain.

**This prompt is written and frozen. Nothing has been executed against it yet — no E1 run, no production coding run.** Awaiting explicit go-ahead before running anything.
