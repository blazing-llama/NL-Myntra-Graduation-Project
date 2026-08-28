// Shared types. "Barrier" fields are intentionally generic (not fit-specific) —
// Section B's comparison logic swaps once Phase 5 selects the actual barrier;
// the shell (confidence states, traceability, sticky CTA) does not change.

export type ConfidenceLevel = "high" | "medium" | "insufficient";

export type WishlistGroup = "buying_soon" | "style_ideas";

export type StockState = "in_stock" | "low_stock" | "back_in_stock" | "out_of_stock";

export interface ComparisonRow {
  label: string; // e.g. "BUST", "TYPICAL PRICE"
  before: string; // user's retained-purchase value, e.g. `34"` or `₹1,499`
  after: string; // wishlisted item's value
  delta: string; // e.g. "+2\"" or "-12%"
}

export interface ResearchTrace {
  findingId: string; // e.g. "F-014" — cites a discovery-engine finding, wired once Phase 5 lands
  summary: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  category: string; // e.g. "Jeans", "Dresses" — drives the wishlist grid's category chips
  imageUrl: string; // AI-generated sample imagery — see mock-data/personas.ts header comment
  imageAlt: string;
  price: string;
  group: WishlistGroup;
  wishlistedAt: string; // ISO datetime — drives the "why now" badge's ~48h age gate
  stock: StockState;
  restockedAt: string | null; // round 2 item 8: a genuine restock event (went out of stock, came back) — real evidence, not fabricated
  addedToCartAt: string | null; // requirement #1: item stays wishlisted even after cart-add
  confidence: ConfidenceLevel;
  comparisonRows: ComparisonRow[]; // empty for "insufficient"
  priceHistory?: number[]; // round 2 item 5: recent price points (oldest -> newest) driving the price-pulse sparkline; only present when price is part of the confidence reasoning
  narration: string; // placeholder for the LLM explanation layer — see mvp/api/narrate.ts
  missingForHigherConfidence?: string; // shown only in "medium"
  whatWouldHelp?: string; // shown only in "insufficient"
  trace: ResearchTrace;
}

// Phase 3 (docs/PHASE_PLAN.md): a catalog product shown on the Browse/
// Discovery page, distinct from WishlistItem until a shopper saves it (the
// heart toggle promotes a BrowseItem into a full WishlistItem — see
// App.tsx's handleToggleWishlist).
export interface BrowseItem {
  id: string;
  name: string;
  brand: string;
  category: string; // matched against a persona's own wishlist categories to drive the similarity indicator
  imageUrl: string;
  imageAlt: string;
  price: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string; // real interview quote, shown on the picker's info-panel step
  barrier: string; // plain-language barrier summary, no internal jargon
  researchNote: string; // "where this comes from" — honest sourcing line, round 2 item 1
}
