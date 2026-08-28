# 7-Phase MVP Feature Round — Plan

Written 2026-08-28, before execution. Captured in-repo per project discipline: plans and decisions live in files, not just conversation history.

Locked Section A requirements apply throughout: 3 confidence states always icon+color+label paired, sticky CTA, wishlist persists after cart-add, simulated-data labeling, no client-side keys.

## Phase 0 — Tooling setup

Install the no-ai-slop skill:
```
npx skills add petergyang/no-ai-slop --skill no-ai-slop --global --yes
```
Writing-clarity skill (strips cliché AI phrasing) — applied in Phase 6 to UI copy strings, not code.

Also fetch 1–2 DESIGN.md references from `github.com/VoltAgent/awesome-design-md` purely for STRUCTURAL inspiration (component states, spacing rhythm). Do NOT adopt any other brand's colors — the existing locked palette (Bone/Ink/Thread Plum/Moss/Ochre/Clay Rose) stays exactly as-is. Report which reference(s) used and confirm the palette wasn't touched.

## Phase 1 — New product images (additive, not a replacement)

A zip of 30 new product images + manifest.json, provided separately. These sit ALONGSIDE the existing 30 images under `mvp/public/product-images-v2/`, not replacing them. Manifest suggests: `browse_page_candidates` (12 items, for Phase 3), `occasion_driven_saver_additions` (8 items, festive/ethnic wear for that persona), plus additions for the other two personas. Add the same AI-generated-sample-imagery disclosure note used for the original 30.

## Phase 2 — Persona picker: modify existing interaction, not a rebuild

`PersonaPicker.tsx` already has a two-step flow (tap → separate info panel screen → Select). Change the PATTERN only: tap a persona card → it expands INLINE within the grid (push other cards down, no navigation away) showing the same existing real content (interview-derived barrier, real quote, sourcing line) → a "Select" button sits inside the expanded card. Selecting routes to Phase 3's Discovery page.

## Phase 3 — New: Browse/Discovery page

Genuinely new screen, confirmed not to exist yet. Becomes the persona's shopping home after selection — wishlist and cart become reachable via header icons (heart icon, cart icon with badge count), not a strictly linear flow.

Top banner: dynamic prompts COMPUTED from that persona's real wishlist state (a low-stock item, longest-unbought item, or a style-idea suggestion from saved items) — never hardcoded/fabricated copy.

Product grid: 8–12 items from `browse_page_candidates`. Each card needs:
- Heart icon (toggle wishlist save)
- Add to Cart button
- Buy Now button
- "Similar to [item] in your wishlist" indicator, WITH THIS PRECEDENCE: check cart first — if a similar item is already in cart, show a cart-aware message instead (e.g. "You already have something similar in your cart") rather than suggesting they save it again. Only show the wishlist-similarity message if nothing similar is in the cart. If neither, show no indicator.

## Phase 4 — Cart page: do not rebuild

`CartView.tsx` already exists and works (built and verified in an earlier round). Only new work: wire Buy Now buttons (Phases 3 and 5) to add the item (if not already present) and navigate directly to the EXISTING cart page — the honest behavioral difference from Add to Cart, which stays on the current page with a toast instead. Log both as distinct Supabase event types (`add_to_cart` vs `buy_now`) for future measurement.

## Phase 5 — Wishlist restructure (partial — preserve existing work)

Keep the existing Out-of-Stock section EXACTLY as it is (already correct and verified, including the checkbox-styled bulk-remove flow — do not touch it). ADD three new sections ABOVE it, in this order: Back in Stock → Price Drop (recent/lowest) → Low Quantity. Use mock-data fields already present from earlier rounds (restock events, price history, low-stock flags) — don't invent new data. Every item card in every section (new and existing) gets both Add to Cart and Buy Now directly on the card — reuse Phase 3's card component/behavior, don't duplicate it. Confidence badge stays OFF grid cards per the existing locked rule.

## Phase 6 — No-AI-slop pass

Run the no-ai-slop skill (Phase 0) against every user-facing string added/changed in Phases 2–5 — banner copy, button labels, empty states, similarity-indicator text. Report what it flagged/changed. Also do a manual pass against the frontend-design skill's existing anti-patterns (no accent stripes, no gradients, no sparkle/AI-magic styling) given how much new UI surface this adds at once.

## Phase 7 — Full regression + redeploy

Full pass across all 5 personas, in-browser, zero console errors required, before redeploying. Redeploy only after every phase above is individually verified — don't batch it.

## Process notes

- Verify each phase in-browser before moving to the next.
- Report status after EACH phase, not all at once.
- Phase 1 needs the product-images-v2 zip from the user if not already present in the repo before it can start.
