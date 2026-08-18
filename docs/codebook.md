# Codebook — v1 (provisional)

Source: categories and definitions as drafted in `docs/blueprints/02_AGENT_ORCHESTRATION.md` (Coding Agent system prompt) and mirrored in `workflows/discovery-engine-webhook.json`.

**Status: provisional, not yet frozen.** Per project ground rules, this codebook must be hand-frozen and the gold set (`evals/gold_set/`) hand-labelled against it *before* `agents/coding_agent_prompt.md` is written or tuned. Do not treat this v1 as final — it is the starting draft for that freeze step (Phase 2).

**If this file changes after the gold set is labelled, re-label from scratch and log it in `docs/FAILURES.md`** — a taxonomy that drifts mid-run invalidates every downstream percentage.

---

## Fields

```
evidence_id: string
is_relevant: boolean
primary_barrier: one of [
  "fit_size", "price_certainty", "occasion_styling", "quality_trust",
  "availability_decay", "timing_forgetting", "bookmark_not_intent",
  "other", "not_relevant"
]
inferred_segment: string | null
workaround_observed: string | null
confidence_score: number (0–1)
```

## Category definitions

**`is_relevant`** = TRUE only if the text discusses pre-purchase hesitation, wishlist/save behaviour, or comparison-shopping.
= FALSE for delivery complaints, refund-processing-time complaints, and app-crash complaints with no purchase-decision content.

**`fit_size`** = TRUE only if the text explicitly expresses uncertainty about how a garment will fit or what size to order.
= FALSE for general appearance comments, or post-purchase return complaints with no size-uncertainty language.
*Near-misses to watch for:* "the fit was off" (post-purchase complaint, not pre-purchase uncertainty) · "I love how this looks" (appearance, not fit uncertainty).

**`price_certainty`** = TRUE only if the text expresses hesitation tied to whether the price is fair, or whether to wait for it to drop.
= FALSE for a simple statement that something is expensive with no hesitation framing attached.
*Near-misses:* "too expensive" alone (no hesitation/wait framing) · a complaint about a *charged* price post-purchase.

**`occasion_styling`** = TRUE if the text expresses uncertainty about whether an item suits an occasion, or how to style/wear it.

**`quality_trust`** = TRUE if the text expresses doubt about material quality, brand trust, or whether the product will match its listing.
*Near-miss:* a post-purchase quality complaint with no pre-purchase hesitation framing — check `is_relevant` first.

**`availability_decay`** = TRUE if the text describes an item going out of stock, out of size, or a price changing before a decision was made.

**`timing_forgetting`** = TRUE if the text describes simply forgetting about a saved item, with no specific uncertainty named.
*Near-miss:* forgetting *because* of an unresolved uncertainty — code the uncertainty, not timing, if one is named.

**`bookmark_not_intent`** = TRUE if the text indicates the save was for inspiration, styling ideas, or later browsing rather than a near-term purchase plan.

**Ambiguous cases** → `is_relevant = TRUE`, `primary_barrier = "other"`, `confidence_score < 0.5`. Do not force a category.

## Positive / negative examples and near-misses

*To be filled in during the Phase 2 freeze, using real examples pulled from the Phase 1 pilot corpus once it exists — each code needs at least one positive example, one negative example, and two documented near-misses before this file is frozen.*

## Version history

- **v1** (Aug 19, 2026) — initial draft, ported from the provisional Coding Agent prompt. Not frozen.
