# MVP Design Spec — "Fit Confidence" Wishlist Panel

Subject: a single wishlisted item's resolution moment inside a Myntra-style app. Audience: a time-poor shopper who is sizing-anxious about a specific saved item. The page's one job: answer "can I trust this, and why" without ever overclaiming.

**This spec has two layers.** Section A is locked — do not trade these away under time pressure, they came from verified UX research and from the brief's own constraints. Section B is the flexible layer — visual language and specific comparison logic, adjusted once Phase 5 selects the actual barrier.

---

## A. Locked requirements — do not remove in the cut order

These hold **regardless of which barrier the discovery engine ultimately selects** (fit, price, occasion, etc.). They are structural wishlist-commerce UX patterns, not fit-specific.

| # | Requirement | Source | Why it's locked |
|---|---|---|---|
| 1 | Wishlist item stays in the wishlist after being added to cart | UX research | Removes the false "buy now or lose it" pressure; supports repeat consideration |
| 2 | Items can be grouped (e.g. "Buying soon" vs. "Style ideas") | UX research | Directly operationalizes H2 (intent vs. bookmark) as a product feature, not just a research finding |
| 3 | Wishlist is filterable by current size/stock availability | UX research | Prevents the dead-click frustration of opening an item only to find it's gone |
| 4 | Low-stock / back-in-stock signals shown in-list, not just on the PDP | UX research | Manufactures legitimate urgency without violating the no-incentive constraint |
| 5 | Primary action button is sticky/pinned during any decision or checkout-adjacent flow | UX research, case-study-sourced (treat the specific "80% lift" figure as one vendor's case study, not a generalizable number — the *pattern* is well-established, the number is not) | |
| 6 | Deterministic core decides; LLM only narrates | v2 blueprint, Part G | The single most important reliability decision in the whole MVP |
| 7 | Three output states always: High confidence / Medium confidence / Insufficient evidence | v2 blueprint | "I don't know" is a feature, not a failure state |
| 8 | Every recommendation has a visible "why am I seeing this" trace to a research finding | v2 blueprint | Closes the loop between discovery engine and MVP — this is the whole story of the project |
| 9 | No red/green-only signals — every state pairs colour with an icon and a text label | Brief, explicit | Colour-blind accessibility |
| 10 | Simulated/mock data is labelled in the UI itself, not just in the deck | v2 blueprint | Evaluators penalise silent fakery, reward disclosed simulation |
| 11 | No client-side API keys | Brief (implicit via "deploy to production") + basic security | Serverless proxy only |
| 12 | Distraction-free at the decision moment — no upsells, no newsletter modals, nothing competing with the one CTA | UX research | |

**If the discovery engine selects a barrier other than fit** (price certainty, occasion/styling, etc.), only Section B's comparison content changes. The shell — three confidence states, deterministic-core-then-narration, traceability, sticky CTA, wishlist persistence — does not.

---

## B. Visual design

### Design brainstorm (per frontend-design skill process)

**Palette** — named hex, 6 values:

| Name | Hex | Use |
|---|---|---|
| Bone | `#F6F1EA` | Background — warm neutral, evokes pattern-cutting paper, not stark white |
| Ink | `#211D1B` | Primary text — warm near-black |
| Thread Plum | `#5B3A4A` | Primary accent, CTAs, brand identity colour |
| Moss | `#4B6B4F` | High-confidence state — always paired with a check icon, never alone |
| Ochre | `#B5822A` | Medium-confidence state — always paired with a caution icon |
| Clay Rose | `#C97B72` | Scarcity/urgency micro-labels only, used sparingly, always paired with an icon |

*Deliberately not* the cream-background-plus-terracotta-serif combination common in AI-generated design (and not the specific `#D97757` associated with Claude's own interface) — Thread Plum reads as tailoring chalk/thread, not tech-assistant branding.

**Typography** — three roles:

| Role | Face | Use |
|---|---|---|
| Display | Fraunces (variable serif) | Item titles, hero confidence statement — used with restraint |
| Body/UI | Public Sans | Everything else — high legibility, less generic than the default grotesk choice |
| Numeric/utility | IBM Plex Mono | Measurement figures only — see signature element below |

**Layout concept:** single-column, mobile-first, 390px frame. Quick-commerce and fashion browsing are phone-native — a desktop-first demo reads wrong to an evaluator who expects mobile.

**Signature element — "the Measurement Strip":** a monospace comparator showing the user's retained-purchase measurement against the wishlisted item's measurement as two aligned numeral rows with a delta indicator between them:

```
BUST    34" ── +2" ── 36"
WAIST   28" ── +2" ── 30"
```

This is not decorative — it *is* the deterministic-core output, rendered directly. Reused everywhere fit-style reasoning appears. If the selected barrier is price or occasion instead of fit, the same visual device generalizes: e.g. a price-history strip (`TYPICAL ₹1,499 ── −0% ── ₹1,499 today`) or an occasion-match strip. The pattern — aligned monospace figures with an explicit delta — is the signature, not the specific fit use case.

### Screen inventory

1. **Wishlist home** — grouped view (Buying soon / Style ideas), filter by size-availability, low-stock badges inline
2. **Item detail / resolution panel** — the core screen: measurement strip (or barrier-appropriate equivalent), confidence state, narration, "why am I seeing this" expandable trace
3. **Confidence state variants** (same screen, three renders):
   - High: strip + check icon + Moss label + short narration + primary CTA active
   - Medium: strip + caution icon + Ochre label + narration naming what's missing + CTA active with a visible caveat line
   - Insufficient evidence: no strip forced; explicit "We don't have enough of your past purchases in this category to compare confidently" + what data would help + CTA still available but unendorsed
4. **Persona/demo switcher** — since underlying purchase history is simulated, a visible switcher lets a demo viewer pick between 2–3 mock personas; each labelled "Simulated data — derived from primary research" in the UI itself, not a footnote

### Component inventory for Claude Code

`WishlistCard`, `GroupFilterBar`, `StockBadge`, `MeasurementStrip` (or `ComparisonStrip` generalized), `ConfidenceBadge` (three variants, icon+color+label always together), `NarrationBlock`, `WhyAmISeeingThis` (expandable), `StickyCTA`, `PersonaSwitcher`, `SimulatedDataLabel`

### Accessibility floor

Contrast-checked against Bone background for all three confidence colours · icon-first design so colour is never the sole carrier of meaning · visible keyboard focus states · reduced-motion respected on the delta-indicator animation (it should have a static equivalent, not require motion to be understood) · minimum tap target sizes on mobile

### What NOT to build

Selfie-to-fit inference, "body type" as an input field, search, checkout beyond the single sticky CTA, auth flows, any AI-slop signalling (sparkle emojis, "✨ AI Magic" labels, purple gradients) — per v2 Part G and the original UI guidance this project has followed throughout.
