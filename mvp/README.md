# MVP — Wishlist Resolution

Vite + React app. See `docs/blueprints/01_MVP_DESIGN_SPEC.md` for the design spec (Section A requirements are locked, do not remove). Full case-study context — problem statement, research, evals, decisions — lives in the root [`README.md`](../README.md); this file covers only what's specific to the app itself.

**Live:** https://mvp-henna-delta.vercel.app

## Flow

**Persona Picker** (`src/screens/PersonaPicker.tsx`) → **Wishlist Intelligence** (`src/screens/WishlistHome.tsx`) → **Item Detail** (`src/screens/ItemDetail.tsx`), which surfaces the **Decision Check** widget (`src/components/DecisionCheck.tsx` — "Why now" / "If you wait" / "Evidence") → **Cart** (`src/screens/CartView.tsx`, persona-scoped). Secondary, reachable anytime: **Compare Similar** (`src/components/CompareSimilarSheet.tsx`) and **Alternatives** (`src/screens/Alternatives.tsx`).

Five personas, each a different research-confirmed barrier (`mock-data/personas.ts`): Price-Timing Waiter (flagship demo), Fit-Cautious Returner, Occasion-Driven Saver, Quality-Evidence Seeker, Inspiration / Moodboard Saver.

## Data disclosure

- **Persona/wishlist data:** simulated data, derived from primary research (`docs/research-findings.md` — 6 interviews + survey n=32), not real users. Labelled in-app via `SimulatedDataLabel`.
- **Product images:** AI-generated sample imagery for MVP demonstration only, not real product photography. See `public/product-images/manifest.json` for the persona → filename mapping.
