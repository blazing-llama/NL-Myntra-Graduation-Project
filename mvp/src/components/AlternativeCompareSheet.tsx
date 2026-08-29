import type { BrowseItem, WishlistItem } from "../types";

// Phase G (docs/PHASE_PLAN_2.md): Compare, for an Alternatives card, against
// the wishlist item it relates to. Deliberately lighter than Compare
// Similar's wishlist-vs-wishlist comparison (docs/PHASE_PLAN_2.md Phase F)
// — a Browse item has no confidence/stock history yet (it isn't wishlisted
// until saved), so this only compares what's actually known: price and the
// shared category. No confidence or purchase-readiness claim is invented
// for an item that has no evidence on file yet.

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function priceDiffLabel(relatedPrice: number, browsePrice: number): string {
  const diff = browsePrice - relatedPrice;
  if (diff === 0) return "Same price";
  const amount = `₹${Math.abs(diff).toLocaleString("en-IN")}`;
  return diff > 0 ? `${amount} more` : `${amount} less`;
}

interface Props {
  browseItem: BrowseItem;
  relatedItem: WishlistItem;
  onClose: () => void;
  onOpenRelated: () => void;
}

export function AlternativeCompareSheet({ browseItem, relatedItem, onClose, onOpenRelated }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Compare ${browseItem.name} to ${relatedItem.name}`}
      style={{ position: "fixed", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
    >
      <div onClick={onClose} aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(33, 29, 27, 0.35)" }} />
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
        <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 999, background: "var(--color-border)", margin: "4px auto var(--space-md)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>Compare</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ minHeight: 32, minWidth: 32, border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: "var(--color-ink-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Stacked, not side-by-side — consistent with Compare Similar's own
            layout at this frame width. */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {[
            { name: relatedItem.name, brand: relatedItem.brand, price: relatedItem.price, image: relatedItem.imageUrl, alt: relatedItem.imageAlt, label: "Already in your wishlist" },
            { name: browseItem.name, brand: browseItem.brand, price: browseItem.price, image: browseItem.imageUrl, alt: browseItem.imageAlt, label: "This alternative" },
          ].map((row) => (
            <div key={row.name} style={{ display: "flex", gap: 12, padding: 12, background: "var(--color-neutral-bg)", borderRadius: "var(--radius-card)" }}>
              <img src={row.image} alt={row.alt} style={{ width: 56, height: 72, flexShrink: 0, borderRadius: "var(--radius-card)", objectFit: "cover", background: "var(--color-border)" }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>{row.label}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{row.name}</span>
                <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{row.brand}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{row.price}</span>
              </div>
            </div>
          ))}

          <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-secondary)" }}>
            Both are {relatedItem.category} — {priceDiffLabel(parsePrice(relatedItem.price), parsePrice(browseItem.price))} than {relatedItem.name}.
          </p>

          <button
            type="button"
            onClick={onOpenRelated}
            style={{
              alignSelf: "flex-start",
              minHeight: 36,
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
            Review {relatedItem.name}
          </button>
        </div>
      </div>
    </div>
  );
}
