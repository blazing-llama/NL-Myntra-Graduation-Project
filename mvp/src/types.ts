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
  imageLabel: string; // placeholder swatch text, no real product imagery in the skeleton
  price: string;
  group: WishlistGroup;
  stock: StockState;
  addedToCartAt: string | null; // requirement #1: item stays wishlisted even after cart-add
  confidence: ConfidenceLevel;
  comparisonRows: ComparisonRow[]; // empty for "insufficient"
  narration: string; // placeholder for the LLM explanation layer — see mvp/api/narrate.ts
  missingForHigherConfidence?: string; // shown only in "medium"
  whatWouldHelp?: string; // shown only in "insufficient"
  trace: ResearchTrace;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
}
