# Problem Definition

**Date:** 2026-09-05. Written to close a real gap: the brief's Part 4 asks for one clearly articulated problem, shown as the end product of a specific chain — Business Metric → Product Outcomes → AI Discovery → Primary Research → Problem Definition. That chain existed only implicitly, scattered across `README.md`, `docs/research-findings.md`, and `docs/decisions/opportunity-selection.md`. This file assembles it explicitly, in one place, using only evidence already established elsewhere in this repo.

## The chain

**1. Business metric.** Wishlist → Purchase conversion within 30 days (`docs/blueprints/wishlist-conversion-blueprint-v2.md` Part B.1).

**2. Product outcomes it decomposes into.** `Intent × Availability × Re-encounter × Resolution × Checkout` (README §1). Price-certainty was tracked as a related modifier on Resolution, not folded into the multiplicative chain. Given this project's no-money constraint (most price levers unavailable), the real addressable opportunity narrows to **Intent, Re-encounter, and Resolution** — a narrowing derived from the decomposition itself, not assumed going in.

**3. AI discovery.** The review-corpus engine (2,203 items classified, `data/processed/relevance_summary.json`) found real signal in two categories — `quality_trust` (7) and `availability_decay` (5) — and a structural blind spot in the rest: `price_certainty`, `fit_size`, `occasion_styling`, `timing_forgetting`, `bookmark_not_intent` had zero-to-thin corpus positives, not because the barriers aren't real, but because app reviews skew toward post-purchase logistics complaints (`docs/codebook.md`). **This is itself a finding that shaped what came next**: a corpus-only approach would have under-reported five of seven real barriers, so primary research wasn't optional confirmation — it was load-bearing.

**4. Primary research.** The 32-person survey and 6 interviews (`docs/research-findings.md`) closed exactly the gap AI discovery flagged: every corpus-sparse category was independently confirmed real (survey reason-not-bought: price 9/32, quality 7/32, fit 6/32, occasion 4/32; availability decay 32/32, the single most unanimous finding in the project). Four barriers ended up independently confirmed by different methods, not one dominant blocker — documented in full in `docs/decisions/opportunity-selection.md`, including the honest statement that the brief's kill-criteria single-segment selection process wasn't run, because the evidence didn't point to one winner.

**5. Problem definition (this step).** Given four independently real barriers, this project made an explicit editorial choice for the *single* problem definition this document commits to — using the same evidence already on record, not new data:

## The chosen problem

**Target user segment: Price-Timing Waiters** — wishlist-savers who like an item enough to save it, but are deliberately withholding purchase until the price reaches a specific, self-set threshold. Confirmed via two interviewees (P1: saved jeans, "if it was 1,200 I probably would've bought it then and there"; P6: saved sneakers, an explicit ~20–25% target), and the largest single category in both the frozen gold set (`price_certainty`=11, the largest of any barrier) and the survey (9/32, the largest reason-not-bought).

**Why this segment over the other three real ones** (`quality_trust`, `fit_size`, `availability_decay`): not because it's more real — `docs/decisions/opportunity-selection.md` is explicit that it isn't — but because it is the most fully evidenced *and* most fully buildable within this project's constraints: it has the largest gold-set count, a clean quantifiable signal (price history, a number that moves), and a no-monetary-incentive-compliant intervention (showing evidence, not offering a discount). `availability_decay` has the strongest cross-method triangulation (6/6 interviews, 32/32 survey) and deliberately leads the problem-statement framing in the deck for that reason — the two are not in conflict; this document names the segment the MVP was actually built and evidenced deepest for.

**Product outcome to influence:** Resolution — specifically, the rate at which a user's price uncertainty gets resolved (with real information, not a guess) within the 30-day conversion window, before the item decays out of stock or the user's intent fades from re-encountering it too many times unresolved.

**Root cause:** the wishlist, as a product surface, shows a single current price and nothing else. It gives no visibility into whether that price is trending down, holding steady, or already near a plausible floor. A user who is "waiting for the price to drop" has no way to tell, from the app itself, whether waiting is rational or just habit — so the decision stays permanently deferred by default, not because the user lost interest, but because the app never gives them the one piece of evidence that would let them decide.

**Existing user workaround:** users already compensate for this manually, outside the app. `docs/research-findings.md` — 30/32 survey respondents (94%) look outside the app before deciding (other shopping sites, Instagram/YouTube, friends/family); only 2/32 decide using the app alone. This is a real, quantified workaround the product doesn't need to invent — it needs to bring the information users are already leaving the app to find back inside it.

**Why solving it creates real user value:** removes a manual, repeated, cross-platform research chore for a decision the user has already shown real intent toward (they saved the item; they didn't dismiss it). Less re-research effort, less regret from either buying too early or waiting too long on a guess.

**Why it makes business sense:** this is demand that already exists on the platform, already explicit (a saved item), with no acquisition cost — the only failure mode being solved is a stalled decision, not a missing customer. Converting a fraction of already-intent-bearing waits is cheaper than acquiring new intent from scratch.

## What the MVP demonstrates against this problem

The flagship persona (Price-Timing Waiter) and its flagship item (Wide-Leg Jeans) are a direct, traceable build against this exact problem definition — not a generic demo retrofitted to match it after the fact: the item's price-history comparison strip (`mvp/src/components/ComparisonStrip.tsx`) is the concrete answer to "the app shows one price and nothing else," and its Decision Check "If you wait" copy (`mvp/src/screens/DecisionCheck.tsx`) directly answers whether waiting is still rational, using the same price-history data — never a generic "check back later."
