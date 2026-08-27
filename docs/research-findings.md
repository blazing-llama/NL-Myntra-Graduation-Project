# Research Findings — Survey (n=32) + Interviews (n=6)

Source: reviewed with the user in a separate Claude.ai conversation, not previously written into this repo. Transcribed here verbatim from what the user provided on 2026-08-25. This file exists to close that gap — it is not new research, it is the first repo record of research that already happened.

**Status: this is primary qualitative/survey evidence, not yet reconciled with the codebook freeze.** Per project ground rules, `docs/codebook.md` stays unfrozen and `agents/coding_agent_prompt.md` stays unwritten until the full gold set (both tranches) is merged and frozen. This file feeds that process — it does not replace it.

---

## Part 1 — Survey summary (n=32, Google Form responses)

**Why saved:** plan to buy soon 11, liked but unsure 11, comparing options 7, browsing/inspiration only 3.

**Biggest reason not bought:** price uncertainty 9, quality doubt 7, fit doubt 6, occasion fit 4, forgot 3, other 3.

**External research before deciding:** 30/32 look outside the app (shopping sites, Instagram/YouTube, friends/family) before deciding. Only 2/32 decide using the app alone.

**Availability decay:** 32/32 (100%) have had a wishlisted item go out of stock/sold out in their size before deciding — 18 "once or twice," 14 "often."

**Size-prediction trust:** trust but would double-check 19/32, somewhat trust / want to know why 7/32, would not trust 4/32, fully trust blindly 2/32.

**Removal reasons:** found better price 9, lost interest in style 9, item went OOS 6, bought alternative 5, decluttering 3.

---

## Part 2 — Interview confirm/contradict matrix

Six interviews: Person 1–3 (Wave 1, exploratory), Person 4–6 (Wave 2, targeted). "Corpus status" reflects `docs/codebook.md`'s v2 audit of the Play Store corpus (App Store corpus not yet separately audited).

| Category | Interview evidence (cite) | Corpus status | Verdict |
|---|---|---|---|
| `price_certainty` | P1: saved jeans, waiting for a sale price, "if it was 1,200 I probably would've bought it then and there." P6: saved sneakers, explicit target price (~₹2,500, "20-25 percent" off), deliberately waiting. Both wanted **price history**, not just a current price. | Zero clean positive examples (codebook: 56 keyword hits, all satisfied-price praise or post-purchase refund disputes) | **Confirmed, corpus-blind.** Also the single largest survey reason-not-bought (9/32) and largest removal reason (found better price, 9/32) — corpus methodology structurally misses this category, not a low-prevalence one. |
| `fit_size` | P2: saved a relaxed-fit shirt, unsure between M/L, wanted "actual height and weight and what size they bought" from reviews, explicitly avoided buy-two-sizes-and-return due to return hassle. P5 (secondary): wanted reviews from "similar body types." | Zero clean positive examples (codebook: every "size" hit was post-purchase — wrong item shipped, return disputes) | **Confirmed, corpus-blind.** Survey: fit doubt is the 3rd-largest reason not bought (6/32). |
| `quality_trust` | P4: saved a jacket, explicitly didn't want to "gamble" on fabric/quality sight-unseen, wanted a **synthesized** quality summary rather than reading 200 reviews ("more reviews" vs. "better evidence"). | Has 2 real positive examples already (`playstore-nykaa-0dddbaa4-...`, `playstore-ajio-9dc04fd4-...`) — one of only two codebook categories with corpus coverage | **Confirmed, corpus-visible.** Survey: 2nd-largest reason not bought (7/32). The one category where interview and corpus evidence directly triangulate. |
| `occasion_styling` | P3: saved a co-ord set "for ideas," occasion-dependent purchase ("if I had somewhere to go"). P5: saved a dress, decision blocked on "do I actually have a life for this dress," re-encountered only when an actual event came up. | Zero clean positive examples (codebook: the closest hit was actually an order-cancellation complaint, not occasion uncertainty) | **Confirmed, corpus-blind, but smaller.** Survey: 4th-largest reason not bought (4/32) — real but a minority barrier relative to price/quality/fit. |
| `availability_decay` | Universal — all 6 interviewees independently described a saved item going out of stock/size before they decided (P1: "irritating," found an alternative; P2: waited for restock; P3: doesn't care if not planning to buy soon, but "obviously irritating" for real intent; P4: research had already resolved uncertainty when the item disappeared; P5: forced a rushed substitute purchase before an event; P6: says stock-outs now make him decide *faster* on future high-intent items). | Has 1 real positive example (`playstore-myntra-401b801e-...`, "sizes r not available for many liked products") — the clearest corpus positive of any category | **Confirmed strongly, corpus-visible.** Survey: 100% (32/32) have experienced this. Directly supports H5 (availability decay silently kills high-intent saves) — P4's case in particular shows decay hitting *after* uncertainty was already resolved, i.e. killing a save that had already converted to real intent. |
| `timing_forgetting` | P6, clearest case: "forgot about it," doesn't open the app to check the wishlist, and describes a price-drop notification as doing double duty — "it reminds me that I wanted the thing in the first place," not just a price alert. P1 (secondary): some wishlist items are "things I just forgot about." **Contrast — P4 explicitly rejects this framing for himself:** "not really the ones I care about... sometimes I'm deliberately waiting," distinguishing genuine forgetting from deliberate deferral. | Zero clean positive examples (codebook: corpus "forgot" hits are all delivery-agent/logistics language, not user-forgetting) | **Confirmed, real, but a minority pattern** — present but not universal (P4 and P5 both explicitly describe *deliberate* waiting as distinct from forgetting). Survey's lowest-ranked reason-not-bought (forgot, 3/32) is consistent with this being real but smaller than price/quality/fit. |
| `bookmark_not_intent` | P3, clearest and only unambiguous case: describes her wishlist as "more like a moodboard than a shopping list," saved the co-ord set "for ideas mostly," says she often doesn't remember why she saved something. No other interviewee frames a save as pure inspiration with no purchase path — the rest describe deferred-but-real intent blocked by a specific barrier. | Only a borderline/weak positive in the codebook (`playstore-ajio-ef906c03-...`, flagged "force TRUE" caution) | **Real but minority — H2 resolution, see below.** |

**Cross-cutting, not category-specific:**
- **H4 (resolve outside the app):** directly confirmed — P1, P2, P3, P4 all independently describe leaving the app (Instagram, other shopping sites, YouTube, Reddit) to resolve uncertainty before deciding. Survey: 30/32 (94%) do this. Only 2/32 decide app-only.
- **H6 (explainable > confident black-box):** directly confirmed across all 6 interviews. Every interviewee responded positively to a concrete "why you're seeing this" explanation tied to a specific past purchase/preference (e.g. P1: "because you bought this brand before" vs. generic "recommended for you," which P6 says he "ignores"). None said they would trust an explanation blindly — P2, P4 explicitly said they'd still verify. This matches the survey's size-trust distribution: the largest single group (19/32) is "trust but would double-check," not blind trust or full distrust.

---

## Part 3 — H2 resolution

**H2 — "A material share of adds were never purchase intent, so the denominator is structurally inflated."**

**Resolution: `bookmark_not_intent` is real but a minority pattern, not the dominant explanation for non-conversion.**

- Interview evidence: 1 of 6 interviewees (P3) describes a save with no purchase path at all ("moodboard," "for ideas mostly"). The other 5 describe deferred-but-genuine intent, each blocked by a specific, nameable barrier (price for P1 and P6, fit for P2, quality for P4, occasion-timing for P5).
- Survey evidence: 3/32 (~9%) chose "browsing/inspiration only" as their reason for saving — the smallest of the four reasons offered, versus 11/32 "plan to buy soon" and 11/32 "liked but unsure."
- Together these converge on the same ~1-in-10 order of magnitude from two independent methods (interviews and survey), which is itself worth noting as corroboration rather than coincidence.

**Conclusion:** H2 is not falsified, but it is narrower than the pre-committed hypothesis implied. Most saves reflect genuine deferred purchase intent blocked by a specific, identifiable barrier (price, fit, quality, occasion, or decay) — not inflated-denominator noise. The denominator is inflated by roughly a tenth, not by half or more. This should inform the segment × barrier matrix (`docs/hypotheses.md` C.2): `bookmark_not_intent` belongs in that matrix as a real, minority category, not as evidence that the whole non-conversion signal is unreliable.

---

## Part 4 — What this means for the corpus/gold-set gap

The pattern across every category is consistent: **`quality_trust` and `availability_decay` are the only two categories with real Play Store corpus positives, and they are also the only two categories where interview evidence and corpus evidence agree.** The other four (`fit_size`, `price_certainty`, `occasion_styling`, `timing_forgetting`) and the minority category `bookmark_not_intent` are all **interview-confirmed as real, but corpus-near-zero or corpus-zero on Play Store** — undercounted by review-corpus methodology, not fabricated categories. App reviews structurally skew toward post-purchase logistics complaints; pre-purchase hesitation language is rare there by the nature of what makes someone write a Play Store review at all. This is the same structural finding already logged in `docs/decisions/product-and-source-choice.md` and `docs/codebook.md`, now corroborated by a second, independent method (interviews + survey) rather than resting on corpus absence alone.

This directly motivates gold-set tranche 2 being drawn with explicit weighting toward the four sparse categories (see below) — the interviews tell us where to look; the corpus alone would not have.
