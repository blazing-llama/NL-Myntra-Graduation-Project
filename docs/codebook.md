# Codebook — v3 (2026-09-05 — two categories added, see version history)

Source: field schema and category definitions originally drafted in `docs/blueprints/02_AGENT_ORCHESTRATION.md` (Coding Agent system prompt). This version replaces v1's placeholder examples with real phrases pulled from the 613-item cleaned Play Store corpus (`data/processed/clean_myntra.json`, `clean_ajio.json`, `clean_nykaa.json`).

**Status: still not frozen.** Per project ground rules, freezing happens only once the gold set is hand-labelled against it and `agents/coding_agent_prompt.md` is ready to be written. **This draft has a real gap worth surfacing rather than papering over:** five of the seven barrier categories have zero or near-zero clean positive examples in the Play Store corpus. This is not a codebook-writing failure — it's the same structural finding already logged in `docs/decisions/product-and-source-choice.md`: app reviews skew toward post-purchase logistics complaints, not pre-purchase hesitation. Keyword collisions (e.g. "size", "price", "quality" appearing in complaints about an order already placed) are abundant; genuine pre-purchase uncertainty language is not. **Do not freeze until each category either has a real positive example (likely from the Reddit corpus once it lands) or a deliberate, logged decision that near-zero prevalence is itself the finding for that category.**

**If this file changes after the gold set is labelled, re-label from scratch and log it in `docs/FAILURES.md`.**

---

## Fields

```
id: string
is_relevant: boolean
primary_barrier: one of [
  "fit_size", "price_certainty", "occasion_styling", "quality_trust",
  "availability_decay", "timing_forgetting", "bookmark_not_intent",
  "social_validation", "comparison_shopping",
  "other", "not_relevant"
]
inferred_segment: string | null
workaround_observed: string | null
confidence_score: number (0–1)
```

**v3 note on the two new categories:** neither has ever been run against any corpus item — see `docs/decisions/codebook-v3-amendment.md` for why they were added, what evidence grounds them, and exactly what has and hasn't been evaluated. Do not read their presence here as meaning they have corpus or gold-set coverage; they don't, same as three of the original seven.

## Category definitions, with real corpus examples

### `is_relevant`
TRUE only if the text discusses pre-purchase hesitation, wishlist/save behaviour, or comparison-shopping. FALSE for delivery, refund-processing-time, and app-crash complaints with no purchase-decision content.

- **Positive** (`playstore-ajio-ef906c03-...`): *"Ajio, I want to ask you something, is the capacity of maximum 70 wishlist item justified? ... In other websites one can save 1000 and above."* — directly about wishlist behaviour.
- **Negative** (`playstore-ajio-10134530-...`): *"items browsing information is very fast."* — mentions browsing but is generic app-speed praise, no hesitation or save-behaviour content.
- **Near-miss** (`playstore-myntra-b3fee1cb-...`): a long post-purchase return/quality-check dispute that happens to contain the words "size," "quality," and "trust" — reads relevant on keyword match alone, is actually a pure post-purchase complaint. **This is the single most common false-positive pattern in this corpus** — keyword-match without hesitation framing.

### `fit_size`
TRUE only if the text explicitly expresses uncertainty about how a garment will fit or what size to order, **before** a purchase decision. FALSE for general appearance comments or post-purchase return complaints with no size-*uncertainty* language.

- **Positive:** *(none found in the Play Store corpus — every "size"-adjacent hit was post-purchase: wrong size delivered, size-based return/exchange disputes. Needs a Reddit-sourced example before freeze.)*
- **Negative** (`playstore-myntra-0a4bdb9b-...`): *"The quality is good, fitting is perfect... Definitely worth the price."* — fit mentioned, but confirmatory/post-purchase, not uncertainty.
- **Near-miss** (`playstore-ajio-bc79bf55-...`): *"I received an order that was not the correct size, even though M is my perfect size for most clothes..."* — sounds fit-related, but it's a wrong-item-shipped complaint after purchase, not pre-purchase sizing doubt. Do not code as `fit_size`.

### `price_certainty`
TRUE only if the text expresses hesitation tied to whether the price is fair, or whether to wait for it to drop. FALSE for a simple statement that something is expensive/cheap with no hesitation framing.

- **Positive:** *(none found — the 56 keyword hits split almost entirely into satisfied-price praise or post-purchase refund/charge disputes; no "waiting to see if it drops" or "not sure it's worth it" framing appeared. Needs a Reddit-sourced example before freeze.)*
- **Negative** (`playstore-myntra-5bea6de1-...`): *"low price, better quality."* — a satisfied statement, no hesitation.
- **Near-miss** (`playstore-myntra-98a106b4-...`): *"I ordered 5 Libas sarees at an offer price, and all 5 were confirmed and shipped. Later, Myntra automatically cancelled them..."* — "offer price" appears, but the hesitation is about the platform's cancellation, not about the price itself. Do not code as `price_certainty`.

### `occasion_styling`
TRUE if the text expresses uncertainty about whether an item suits an occasion, or how to style/wear it.

- **Positive:** *(none found. The closest hit, `playstore-ajio-a79ec24a-...` — "I had planned a shirt for an occasion. ruined my plans." — is about an order cancellation, not uncertainty over occasion fit; logged below as a near-miss instead. Needs a Reddit-sourced example before freeze.)*
- **Negative:** most "occasion"/"wear" hits in this corpus are unrelated app-quality complaints that happen to share vocabulary (see keyword-scan hits for this category — customer-service complaints, delivery disputes).
- **Near-miss** (`playstore-ajio-a79ec24a-...`): *"...I had planned a shirt for an occasion. ruined my plans."* — occasion is named, but the barrier is order cancellation/logistics, not uncertainty about whether the item suits the occasion. Do not code as `occasion_styling`.

### `quality_trust`
TRUE if the text expresses doubt about material quality, brand trust, or whether the product will match its listing — **doubt**, not a settled complaint or settled praise.

- **Positive** (`playstore-nykaa-0dddbaa4-...`): *"the offer is good what is the quality of of products"* — a genuine open question about quality, unresolved.
- **Positive, weaker** (`playstore-ajio-9dc04fd4-...`): *"quality is very good but price is and discount not apply"* — mixed signal, borderline; flag for review rather than force TRUE.
- **Negative** (`playstore-myntra-3a917bd6-...`): *"appreciate quality and product are trustful"* — quality/trust language present, but it's confirmed satisfaction, not doubt.
- **Near-miss** (`playstore-myntra-29ce8004-...`): *"the product looks good but the quality is not good, fabric is too stretchable"* — reads like quality doubt, but the tense/framing indicates the product was already received (post-purchase judgment), not a pre-purchase doubt. Borderline — flag for review; the ambiguity itself is worth keeping as a documented near-miss.

### `availability_decay`
TRUE if the text describes an item going out of stock, out of size, or a price changing before a decision was made.

- **Positive** (`playstore-myntra-401b801e-...`): *"sizes r not available for many liked products"* — "liked products" reads as wishlist/saved items whose sizes disappeared — the clearest real positive example in the whole corpus.
- **Negative** (`playstore-nykaa-282537a2-...`): *"Good stuff is available, the stuff is very useful."* — "available" present, no decay/scarcity content.
- **Near-miss** (`playstore-ajio-1c2b9f17-...`): *"please updated. out of stock also showing in your app display... showing no stock availability in your pin code..."* — about out-of-stock listings appearing in search results (an app-display bug complaint), not about an item the user had already saved going out of stock before they could decide. Do not code as `availability_decay`.

### `timing_forgetting`
TRUE if the text describes simply forgetting about a saved item, with no specific uncertainty named.

- **Positive:** *(none found — the corpus's "forgot"/"later" hits are all about delivery-agent or app-server failures, not the user forgetting a saved item. Needs a Reddit-sourced example before freeze.)*
- **Negative** (`playstore-nykaa-1a98cd25-...`): *"...delivery is super fast..."* — "later" appears in a comparison clause, unrelated.
- **Near-miss** (`playstore-nykaa-48a7fdea-...`): *"...he told me he forgot to pick up the parcel..."* — "forgot" present, but it's the delivery agent forgetting a pickup, not the user forgetting a wishlist item. Do not code as `timing_forgetting`.

### `bookmark_not_intent`
TRUE if the text indicates the save was for inspiration, styling ideas, or later browsing rather than a near-term purchase plan.

- **Positive, weak/borderline** (`playstore-ajio-ef906c03-...`): the 70-item wishlist-capacity complaint implies heavy accumulation behaviour consistent with bookmarking-not-buying, but the user never explicitly states intent (or lack of it) — flag for review rather than force TRUE. **True clean positive not yet found — needs a Reddit-sourced example before freeze.**
- **Negative** (`playstore-ajio-10134530-...`): *"items browsing information is very fast."* — "browsing" present, unrelated (app-speed praise).

### `social_validation`
TRUE if the text expresses that a purchase decision depends on, or was helped by, input from other people — friends, family, influencers, or social proof — rather than the platform's own product information.

- **Grounding, not corpus-derived:** survey (`docs/research-findings.md` Part 1) — 30/32 (94%) look outside the app before deciding, and friends/family are named alongside shopping sites and Instagram/YouTube as one of those external sources (`docs/research-findings.md` Part 2, H4). No interview quote isolates social input as the *sole* barrier (it's bundled with general "external research" in H4), so this is a real, evidenced category but a thinner one than the other seven — flagged honestly, not inflated.
- **Positive:** *(none found — never run against the Play Store corpus or any other corpus. Needs a real classification pass before a positive/negative/near-miss example can be logged here.)*

### `comparison_shopping`
TRUE if the text describes actively weighing this item against other specific options (a different product, a different app/site) before deciding, distinct from `price_certainty` (which is about whether *this item's own* price is fair) and from `quality_trust` (doubt about *this item's* quality).

- **Grounding, not corpus-derived:** survey (`docs/research-findings.md` Part 1) — "comparing options" is 7/32 (22%) of stated reasons for saving an item, the third-largest category after "plan to buy soon" and "liked but unsure." `is_relevant`'s own definition has referenced "comparison-shopping" as in-scope since v1, but no barrier category ever captured it on its own — this closes that gap.
- **Positive:** *(none found — never run against the Play Store corpus or any other corpus. Needs a real classification pass before a positive/negative/near-miss example can be logged here.)*

## What this means for the freeze decision

Two categories (`quality_trust`, `availability_decay`) have real, usable positive examples from this corpus. Three (`fit_size`, `price_certainty`, `occasion_styling`) have none, and one (`timing_forgetting`) has none; `bookmark_not_intent` has only a borderline case. **This should not be read as "these barriers don't exist"** — it's consistent with v2's own prediction that Play Store reviews structurally under-represent pre-purchase hesitation. The negative and near-miss examples above are strong and corpus-grounded regardless; they're the same value either way. Positive-example gaps should close once the Reddit corpus (`data/raw/reddit_manual.jsonl`) is cleaned and available — revisit this file then, before the actual freeze.

## Version history

- **v1** (2026-08-19) — initial draft, placeholder descriptions only, ported from the provisional Coding Agent prompt.
- **v2** (2026-08-19) — replaced placeholders with real corpus-sourced positive/negative/near-miss examples for every category; explicitly flagged which categories still lack a real positive example. Not frozen.
- **v3** (2026-09-05) — added `social_validation` and `comparison_shopping` as full categories (previously not represented anywhere in the taxonomy, a real gap against the project brief's own question list — see `docs/decisions/codebook-v3-amendment.md`). Neither the frozen gold set nor `evals/e1_results.json` / `evals/e3_results.json` were touched or re-run: those remain exactly what they were, evaluating the original 9-category v2 taxonomy. The two new categories currently have zero evaluation of any kind, consistent with how this file has always reported zero-coverage categories — not silently implied as covered.
