import type { Persona, WishlistItem } from "../src/types";

// Simulated data, derived from primary research personas — not real users.
// requirement #10: this must be labelled in the UI itself (SimulatedDataLabel),
// not only in the deck.
//
// Product images: real Unsplash photos, hardcoded direct CDN URLs (not the
// deprecated source.unsplash.com random-hotlink pattern). No live API call at
// runtime, no key anywhere. Free to use under the Unsplash License (no
// permission required, attribution appreciated not required). None sourced
// from Myntra/AJIO/Nykaa or any real brand — stock editorial photography only.

function unsplash(photoId: string, w = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80&fit=crop&auto=format`;
}

// Relative to "now" so the WhyNowBadge's ~48h age gate demos correctly
// whenever this is viewed, rather than going stale against a hardcoded date.
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

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
      imageUrl: unsplash("1608234808654-2a8875faa7fd"),
      imageAlt: "Woman in a structured grey blazer and black trousers",
      price: "₹3,299",
      group: "buying_soon",
      wishlistedAt: hoursAgo(24 * 5), // 5 days ago — past the 48h gate, badge shows
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
      imageUrl: unsplash("1687825515654-23620796760c"),
      imageAlt: "Woman in a white top and wide-leg green trousers",
      price: "₹1,899",
      group: "buying_soon",
      wishlistedAt: hoursAgo(6), // 6h ago — under the 48h gate, badge hidden despite confidence != insufficient
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
      imageUrl: unsplash("1704775989614-8435994e4e97"),
      imageAlt: "Woman in a dark blue draped dress against a maroon background",
      price: "₹2,450",
      group: "style_ideas",
      wishlistedAt: hoursAgo(24 * 10), // 10 days ago — old enough, but insufficient-evidence gate keeps badge hidden
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
      imageUrl: unsplash("1594019739447-6c8a1d744d61"),
      imageAlt: "Woman in a black satin spaghetti-strap slip dress",
      price: "₹4,199",
      group: "buying_soon",
      wishlistedAt: hoursAgo(24 * 4), // 4 days ago — badge shows, "what if I wait" cites the real back-in-stock fact
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
      imageUrl: unsplash("1741847639057-b51a25d42892"),
      imageAlt: "Woman posing in a pink floral embroidered kurta and pants",
      price: "₹2,899",
      group: "style_ideas",
      wishlistedAt: hoursAgo(24 * 3), // 3 days ago — old enough, but insufficient-evidence gate keeps badge hidden
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
