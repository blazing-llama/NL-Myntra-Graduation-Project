# Phase Plan 2 — Product & UI Quality Round (Last Major Feature Round)

Written 2026-08-29, before any Phase A-L work begins, per this project's own
discipline (plans live in files, not just chat — a session interruption
already happened once this project and cost context). Deadline: 6 days out
from Sep 5, 3:59 PM IST. This is the LAST major feature round before final
regression, README, and compliance polish.

## Business framing (do not relitigate)

Graduation project, Growth PM case. Business goal: increase the % of users
who purchase at least one item from their wishlist within 30 days, without
monetary incentives. MVP should read as a premium fashion-commerce wishlist
*decision layer*, not a generic storefront and not a generic AI demo.

Opportunity space is **multi-barrier** — this is the finalized research
position (`docs/decisions/product-and-source-choice.md`). Not reopened here.
All 5 personas stay available. **Price-Timing Waiter is the flagship demo
path** — clearest wedge for showing confidence-building without discounts.

## Pre-build inspection findings (checked before writing this plan)

- `WishlistItem` has no `bookmark_not_intent` tag field. The closest concept
  is `group: "buying_soon" | "style_ideas"`, which already drives an
  existing filter and means something narrower. **Phase D's "Style ideas
  only" section, gated on a literal `bookmark_not_intent` tag, has no such
  tag to check — so per the phase's own instruction ("hide entirely if none
  exist, don't force items into it"), this section is HIDDEN. Not built as
  a repurposed `group` filter — that would be inventing scope the plan
  explicitly warned against.**
- `findingId` (e.g. `INT-P1`) already never renders user-facing — confirmed
  via grep; `AITraceWidget` only exposes `item.trace.summary`, never
  `findingId`. Phase E's "no INT-P1 anywhere user-facing" constraint is
  already satisfied structurally; the copy tightening in Phase E is about
  the *summary/narration strings*, not `findingId` exposure.
  `mock-data/personas.ts` still has `findingId: "INT-P1"` etc. as internal
  keys — left as-is, they're data, not UI.
  `App.tsx`'s `toWishlistItem` also sets `findingId: "BROWSE"` for the same
  reason — internal only.
- `SimilarItemsSheet.onOpenItem` already calls the same `setOpenItemId`
  handler wired everywhere else — reading the code, tapping a compared item
  should already open its detail page correctly. **Phase F says verify
  before assuming broken — will confirm in-browser rather than "fixing" a
  non-bug.**
- Current flow after persona select routes to `Discovery` (built last
  round). Phase A reverses this: land on Wishlist directly, Discovery
  becomes secondary ("Alternatives").
- Existing palette tokens (`tokens.css`): Bone/Ink/Thread Plum/Moss/Ochre/
  Clay Rose. Confirmed already satisfies "near-white bg / charcoal text /
  premium accent." Phase B is structural only — no new hex values.

## Flow after this round

Persona picker → Persona context (inline, Phase C) → Wishlist Intelligence
(primary, Phase D) → Item Decision Page (Phase E) → Cart (Phase H).
Alternatives (Phase G) and Compare Similar (Phase F) are reachable
secondary surfaces, not steps in the primary path.

## Phase list (verify each in-browser before moving on; report per-phase)

**A — Product narrative & navigation.** Persona select lands on that
persona's wishlist (not Discovery). Wishlist header renamed to whichever of
"Wishlist Intelligence" / "Decision-ready wishlist" fits existing tone
better (decided during build, reported). Discovery renamed "Alternatives,"
demoted to secondary. Nav: Wishlist / Alternatives / Cart / Switch persona,
active section visibly marked on mobile.

**B — Structural refinement, existing palette only.** Fewer boxes/borders,
more whitespace, stronger hierarchy, larger imagery, refined sticky
actions/cards, subtle motion, ≤8px card radius, accessible contrast.
Mobile-first at 390px. No new hex, no gradients/blobs/sparkle/bubbly UI.

**C — Persona picker upgrade.** Price-Timing Waiter first/most prominent.
All 5 stay available. Tap expands/shows context, no auto-navigate. CTA
"View wishlist" (not "Select"). No internal research/file language
user-facing; provenance stays human-readable. Card: name, one-line
blocker, short quote, small blocker-type marker.

**D — Wishlist Intelligence screen.** Sections, existing data only: Ready
to decide (high confidence) / Needs more evidence (medium/low/insufficient)
/ Style ideas only (hidden — see inspection finding above) / Out of stock
(untouched logic + bulk remove). Existing stock/commercial signals stay as
inline badges. No confidence badge on grid cards. Card: image, brand, name,
price, blocker/status badges, one short decision hint, primary CTA "Review
decision," secondary "Compare similar" if relevant. "Buy Now" →
"Move to cart" everywhere (same add+navigate behavior, renamed). Compact
insight summary near top: ready/needs-evidence/out-of-stock counts +
optional one-line next-best action.

**E — Item Decision Page.** Large image, name/brand/price, confidence
badge, one-line verdict, price/evidence card, Decision Check widget (renamed
from AI Trace, tabs: Why now / If you wait / Evidence), sticky bottom CTA.
Plain-language copy pass project-wide per the examples given — no jargon,
model-speak, research IDs, "cluster," "finding ID," or raw `INT-P1` anywhere
user-facing (already structurally true per inspection — this phase is the
prose-tightening pass). Sticky CTA: "Move to cart" / "In cart — still in
wishlist." Cart reachable from detail. Toast renders above sticky CTA, never
overlapping.

**F — Compare Similar.** Rename "Similar items" → "Compare similar." Real
comparison: current item vs. similar item, price difference, plain-language
similarity reason, key difference, which reads more purchase-ready (from
existing confidence/status fields only — no new scoring system). CTA
"Review this item." Stack at 390px if cramped. Verify-first: confirm
whether opening a compared item is actually broken (inspection above
suggests it isn't) before changing anything there. Move to Cart after
opening from Compare Similar must target the item being viewed, not the
source. Never show the CTA with an empty comparison.

**— Pause after F: consolidated status on A-F before G-L. —**

**G — Alternatives screen.** Secondary. Substitutes tied to existing
wishlist items, not generic browsing. Each alternative explains which
wishlist item it relates to. Honest CTAs only: Save / Compare / Move to
cart. No "Buy Now" anywhere.

**H — Cart.** Persona-scoped and labeled. Items from wishlist/detail/
compare all show correctly. Wishlist persistence after cart-add holds.
Back route returns to the correct previous screen. No checkout simulation
or purchase-finalizing language.

**I — Trust/ethics/urgency audit.** No fabricated urgency, no fake
countdowns, no fake social proof, low-stock language only where mock data
supports it, confidence never color-only, insufficient-evidence states
honest and non-blank, zero raw jargon/file paths/respondent IDs/cluster or
finding IDs user-facing.

**J — Responsiveness & accessibility.** 390px / 768px / 1280-1440px: no
horizontal overflow, no clipped tabs/buttons, no overlapping sticky CTA/
toast, comfortable tap targets, visible focus states, accessible button
names, color never sole status signal, minimum readable font sizes.

**K — Full regression.** All 5 personas, in-browser, the full checklist
from the user's instructions (persona picker flow, wishlist-first landing,
Alternatives secondary, decision-readiness sections, no grid confidence
badge, item detail completeness, Decision Check tabs, Move to cart toast,
no double-add on rapid tap, cart routing, Compare Similar never empty and
opens correctly + targets viewed item, no persona-switch data bleed,
wishlist persistence, insufficient-evidence honesty, out-of-stock bulk
remove intact, zero jargon/fabricated urgency, 3 breakpoints clean, zero
console errors, all images load).

**L — Deploy.** Only after K passes. Report: live URL, what changed per
phase, known limitations, explicit `vercel alias ls` confirmation of no
leaked auto-generated alias.
