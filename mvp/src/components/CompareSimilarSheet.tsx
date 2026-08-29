import type { ConfidenceLevel, WishlistItem } from "../types";
import { ProductImage } from "./ProductImage";

// Phase F (docs/PHASE_PLAN_2.md): renamed from "Similar items" to "Compare
// similar" and upgraded from a plain list into a real comparison against
// the source item — price difference, why they're grouped together, the
// most meaningful concrete difference, and which one currently reads more
// purchase-ready. All of this comes from fields already on WishlistItem
// (confidence, stock, price) — no new scoring system invented.
//
// Verified before building (not assumed): opening a compared item's detail
// page already worked correctly in the prior round — this file only adds
// comparison content, it doesn't touch the open/close wiring.

interface Props {
  sourceItem: WishlistItem;
  items: WishlistItem[]; // same-category candidates, source item excluded by caller
  onClose: () => void;
  onOpenItem: (id: string) => void;
}

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function priceDiffLabel(sourcePrice: number, candidatePrice: number): string {
  const diff = candidatePrice - sourcePrice;
  if (diff === 0) return "Same price";
  const amount = `₹${Math.abs(diff).toLocaleString("en-IN")}`;
  return diff > 0 ? `${amount} more` : `${amount} less`;
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { insufficient: 0, medium: 1, high: 2 };

function readinessLabel(source: WishlistItem, candidate: WishlistItem): string {
  const sourceRank = CONFIDENCE_RANK[source.confidence];
  const candidateRank = CONFIDENCE_RANK[candidate.confidence];
  if (candidateRank > sourceRank) return `More purchase-ready than ${source.name} — stronger evidence on file.`;
  if (candidateRank < sourceRank) return `Less purchase-ready than ${source.name} right now.`;
  return `About as purchase-ready as ${source.name}.`;
}

function keyDifference(source: WishlistItem, candidate: WishlistItem): string {
  if (source.stock !== candidate.stock) {
    return `Stock differs: ${source.name} is ${source.stock.replace("_", " ")}, this one is ${candidate.stock.replace("_", " ")}.`;
  }
  const sourcePrice = parsePrice(source.price);
  const candidatePrice = parsePrice(candidate.price);
  if (sourcePrice !== candidatePrice) {
    return `Price differs — see the difference above.`;
  }
  return "Very similar overall — the main difference is styling, not evidence.";
}

export function CompareSimilarSheet({ sourceItem, items, onClose, onOpenItem }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Compare similar to ${sourceItem.name}`}
      style={{
        // See Toast.tsx: position:"absolute" was tried here for the
        // phone-frame mockup (round 3, item 8) and reverted — it broke this
        // sheet's docking at mobile width. Fixed stays correct everywhere.
        position: "fixed",
        inset: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "rgba(33, 29, 27, 0.35)" }}
      />
      <div
        className="bottom-sheet-enter"
        style={{
          position: "relative",
          maxWidth: "var(--frame-width)",
          margin: "0 auto",
          width: "100%",
          maxHeight: "75vh",
          overflowY: "auto",
          background: "var(--color-bone)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
          boxShadow: "0 -4px 20px rgba(33, 29, 27, 0.18)",
          padding: "var(--space-sm) var(--space-md) var(--space-lg)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: "var(--color-border)",
            margin: "4px auto var(--space-md)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
            Compare similar to {sourceItem.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              minHeight: "var(--tap-target-min)",
              minWidth: "var(--tap-target-min)",
              border: "none",
              background: "transparent",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--color-ink-secondary)",
            }}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--color-ink-secondary)" }}>
            Nothing else in this persona's wishlist shares this category yet.
          </p>
        ) : (
          // Stacked, not side-by-side — a 390px frame can't fit two product
          // cards with room for comparison text, so each candidate gets its
          // own full-width block instead of being crammed into a column.
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 12,
                  background: "var(--color-neutral-bg)",
                  borderRadius: "var(--radius-card)",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    style={{
                      width: 56,
                      height: 72,
                      flexShrink: 0,
                      borderRadius: "var(--radius-card)",
                      objectFit: "cover",
                      background: "var(--color-border)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{item.brand}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {item.price} · {priceDiffLabel(parsePrice(sourceItem.price), parsePrice(item.price))}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-secondary)" }}>
                  Grouped with {sourceItem.name} — both are {sourceItem.category}.
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-secondary)" }}>{keyDifference(sourceItem, item)}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>
                  {readinessLabel(sourceItem, item)}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onOpenItem(item.id);
                    onClose();
                  }}
                  style={{
                    alignSelf: "flex-start",
                    minHeight: "var(--tap-target-min)",
                    padding: "0 14px",
                    borderRadius: "var(--radius-card)",
                    border: "none",
                    background: "var(--color-thread-plum)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Review this item
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
