# Hypotheses — Frozen Aug 19, 2026

Source: `docs/blueprints/wishlist-conversion-blueprint-v2.md`, Part C. Frozen before data collection.
**Do not add, remove, or reword these once the coding run starts.** If a hypothesis needs to change, that is a decision worth an entry in `docs/decisions/`, not a silent edit here.

## C.1 — Hypotheses

- **H1** — Non-conversion is primarily unresolved *uncertainty*, not *forgetting*.
- **H2** — A material share of adds were never purchase intent, so the denominator is structurally inflated. *Highest-leverage hypothesis — directly answers the brief's own question about bookmark vs. purchase intent.*
- **H3** — The dominant uncertainty differs by segment.
- **H4** — Users resolve uncertainty *outside* the app and often do not return.
- **H5** — Availability decay silently kills a share of high-intent saves.
- **H6** — Users prefer explainable output over confident black-box output.

## C.2 — Output shape

Findings are reported as a **segment × barrier matrix**, not a ranking:

| Segment | Fit/size | Price certainty | Occasion/styling | Quality/trust | Timing | Availability decay |
|---|---|---|---|---|---|---|

One cell gets picked and defended (Phase 5) — see `docs/decisions/opportunity-selection.md` once it exists.

## C.3 — Kill criteria (pre-committed, relative)

The chosen opportunity must satisfy **all four**:

1. Ranks #1 or #2 among barriers within its segment
2. Carries ≥1.5× the evidence of the #4 barrier in that segment
3. Confirmed across ≥2 source types, including interviews
4. Has an observed user workaround

Additionally abandon if: the only viable solution requires monetary incentive · deterministic-core accuracy <70% on the controlled set · users cannot articulate what the MVP output means.

**Pivot ladder:** Uncertainty resolution → Re-encounter/timing → Intent capture at add → Availability alerting.
