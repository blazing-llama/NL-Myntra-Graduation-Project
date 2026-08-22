import type { Persona, WishlistItem } from "../src/types";

// Simulated data, derived from primary research personas — not real users.
// requirement #10: this must be labelled in the UI itself (SimulatedDataLabel),
// not only in the deck.

export const PERSONAS: Persona[] = [
  {
    id: "frequent-wishlister",
    name: "Ananya — frequent wishlister",
    description: "Saves often, buys occasionally. Sizing-anxious after a bad past return.",
  },
  {
    id: "occasional-saver",
    name: "Rhea — occasional saver",
    description: "Saves for a specific event, decides fast once uncertainty resolves.",
  },
  {
    id: "never-purchases",
    name: "Meher — wishlist, never buys",
    description: "Uses the wishlist as a mood board. Tests H2 — bookmark, not intent.",
  },
];

export const WISHLIST_BY_PERSONA: Record<string, WishlistItem[]> = {
  "frequent-wishlister": [
    {
      id: "item-1",
      name: "Structured Blazer",
      brand: "Aurelia",
      imageLabel: "Blazer",
      price: "₹3,299",
      group: "buying_soon",
      stock: "low_stock",
      addedToCartAt: "2026-08-15T10:00:00Z",
      confidence: "high",
      comparisonRows: [
        { label: "BUST", before: "34\"", after: "36\"", delta: "+2\"" },
        { label: "WAIST", before: "28\"", after: "30\"", delta: "+2\"" },
      ],
      narration:
        "Your last 3 kept purchases ran consistently +2\" over your base measurements in the bust and waist — this jacket's cut matches that pattern closely.",
      trace: {
        findingId: "F-014",
        summary: "Fit-uncertainty cluster, 'sizing anxiety after a bad past return' segment",
      },
    },
    {
      id: "item-2",
      name: "Wide-Leg Trousers",
      brand: "Noor & Co.",
      imageLabel: "Trousers",
      price: "₹1,899",
      group: "buying_soon",
      stock: "in_stock",
      addedToCartAt: null,
      confidence: "medium",
      comparisonRows: [{ label: "WAIST", before: "28\"", after: "29\"", delta: "+1\"" }],
      narration:
        "Waist measurement lines up with what you've kept before, but we don't have enough past purchases in wide-leg trousers specifically to compare rise and inseam confidently.",
      missingForHigherConfidence:
        "No past wide-leg trouser purchases on file — only waist can be compared, not rise or inseam.",
      trace: {
        findingId: "F-014",
        summary: "Fit-uncertainty cluster — partial match, category coverage gap",
      },
    },
    {
      id: "item-3",
      name: "Draped Midi Dress",
      brand: "Ilana",
      imageLabel: "Dress",
      price: "₹2,450",
      group: "style_ideas",
      stock: "out_of_stock",
      addedToCartAt: null,
      confidence: "insufficient",
      comparisonRows: [],
      narration: "",
      whatWouldHelp:
        "This brand's sizing isn't in your purchase history at all — a fit-check photo or one past Ilana purchase would let us compare confidently.",
      trace: {
        findingId: "F-014",
        summary: "Fit-uncertainty cluster — no comparable brand history",
      },
    },
  ],
  "occasional-saver": [
    {
      id: "item-4",
      name: "Satin Slip Dress",
      brand: "Verre",
      imageLabel: "Dress",
      price: "₹4,199",
      group: "buying_soon",
      stock: "back_in_stock",
      addedToCartAt: null,
      confidence: "high",
      comparisonRows: [{ label: "BUST", before: "32\"", after: "32\"", delta: "0\"" }],
      narration: "Exact match to your last kept Verre purchase — same size, same fit family.",
      trace: { findingId: "F-014", summary: "Fit-uncertainty cluster — exact brand/size match" },
    },
  ],
  "never-purchases": [
    {
      id: "item-5",
      name: "Embroidered Kurta Set",
      brand: "Suta",
      imageLabel: "Kurta",
      price: "₹2,899",
      group: "style_ideas",
      stock: "in_stock",
      addedToCartAt: null,
      confidence: "insufficient",
      comparisonRows: [],
      narration: "",
      whatWouldHelp:
        "No purchase history to compare against yet — this persona mostly saves for inspiration rather than near-term buying (see H2).",
      trace: { findingId: "F-002", summary: "Bookmark-not-intent cluster" },
    },
  ],
};
