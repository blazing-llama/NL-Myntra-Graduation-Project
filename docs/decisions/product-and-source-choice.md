# Decision: Product and Source Viability (Phase 1)

**Date:** 2026-08-19
**Gate:** v2 Part A.2, checked against v2 Part I's Aug 20 gate — "is there enough usable discovery data?"

## Method

1. `scrapers/playstore.py`, using `google-play-scraper` (verified live against the Play Store on 2026-08-19 before scaling up — see smoke test in session log), pulled 500 most-recent English-locale reviews (India) for each of the three candidate apps:
   - Myntra — `com.myntra.android`
   - AJIO — `com.ril.ajio`
   - Nykaa Fashion — `com.fsn.nykaa`
   1,500 raw reviews total, committed to `data/raw/playstore_<app>.json`.
2. `pipeline/clean.py` deduped, dropped non-English (langdetect), dropped items under 15 characters, and PII-scrubbed the remainder. Output: `data/processed/clean_<app>.json`.
3. `pipeline/relevance_prefilter.py` ran a minimal, `is_relevant`-only prompt (`agents/relevance_prefilter_prompt.md` — **not** the frozen Coding Agent, no gold set required) against every cleaned item.
   **Model used: `llama3.1:latest` via local Ollama**, not `hermes3:8b` as the blueprint specifies for local work. `hermes3:8b`'s 4.7GB pull did not complete in the session (see `docs/FAILURES.md`, 2026-08-19). `llama3.1:latest` is a reasonable substitute for this narrow yes/no pilot classification; it remains an open item that a real cross-model check (E3) needs a model outside Groq's `gpt-oss` lineage — `llama3.1:latest` is already a different family, so it may also serve that purpose later without a re-pull.

## Results

| App | Raw reviews | Cleaned (usable text) | Relevant (LLM pre-filter) | Relevant rate |
|---|---|---|---|---|
| Myntra | 500 | 248 | **2** | 0.8% |
| AJIO | 500 | 185 | **2** | 1.1% |
| Nykaa Fashion | 500 | 180 | **1** | 0.6% |

All three sit at or below the low end of v2's own pre-registered estimate (1–3% signal rate, ≈0.8–3.2% 95% CI on 500 reviews for the winning app). None of the three apps come close.

The relevant items themselves are thin and mostly adjacent rather than sharply on-target — e.g. a wishlist-capacity complaint (AJIO), two fit/size and quality-doubt mentions (Myntra), a quality-uncertainty-at-purchase comment (Nykaa) — not a rich vein of pre-purchase hesitation language.

## Gate check (v2 Part A.2)

| Usable items from 500 | Action | This app |
|---|---|---|
| >30 | Play Store viable as primary | none |
| 10–30 | Play Store supporting evidence only | none |
| **<10** | **Play Store is background. Reallocate entirely; report the finding.** | **Myntra, AJIO, Nykaa Fashion — all three** |

**All three apps land in the `<10` tier.** Play Store reviews are not viable as the primary discovery source for any of them.

## Decision

1. **Play Store reviews are downgraded to background/corroboration only, for all three apps** — not scaled up to 3,000–5,000 per v2's `>30` branch, per the pre-committed gate.
2. **Reallocate to the sources v2 pre-designated for exactly this outcome:** Reddit (r/IndianFashionAddicts, r/TwoXIndia, r/india, r/DesiFashion — activity not yet verified, per v2's own caveat), YouTube comments on Indian haul/try-on/"worth it?" videos, hand-curated Quora/forum threads. These become primary; app reviews remain a secondary corroboration source.
3. **This is a finding, not a failure**, per v2's own framing: public review corpora are structurally biased toward post-purchase logistics, while wishlist hesitation is pre-purchase and largely silent in public text — which is exactly why the problem is under-served and why primary research (interviews) carries disproportionate weight in this project.
4. **Product choice (which app to build around) is a separate question from source viability**, and the three apps are statistically indistinguishable on this data (2 vs. 2 vs. 1 relevant items — not a basis for ranking, consistent with v2's explicit warning against turning noisy density differences into a headline ranking). Falling back to v2 A.1's stated tie-break — corpus size and community footprint — **Myntra remains the working product choice** for segment/interview framing, but this is a *prior*, not a finding from this pilot.

## What this changes downstream

- Phase 3's discovery-engine corpus should be built primarily from Reddit/YouTube/Quora, not a scaled-up Play Store pull.
- The deck's source-bias table (v2 Part A.3) and evidence labelling should state plainly that Play Store review density was measured and found too thin to use as primary evidence — cite this file and the counts above.
- Interview design (Part F) becomes even more load-bearing, since the two next-best sources (Reddit, YouTube) still carry structurally different biases (see v2 A.3) and none of the three sources alone was expected to carry the finding.
