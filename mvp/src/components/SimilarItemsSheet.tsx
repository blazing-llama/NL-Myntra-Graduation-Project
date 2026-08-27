import type { WishlistItem } from "../types";

// "Similar items" opens here instead of being a dead-end link — per the
// borrowed structural pattern (redrawn, not copied from any real app's UI).

interface Props {
  sourceItem: WishlistItem;
  items: WishlistItem[]; // same-category candidates, source item excluded by caller
  onClose: () => void;
  onOpenItem: (id: string) => void;
}

export function SimilarItemsSheet({ sourceItem, items, onClose, onOpenItem }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Similar to ${sourceItem.name}`}
      style={{
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
          maxHeight: "70vh",
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
            Similar to {sourceItem.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              minHeight: 32,
              minWidth: 32,
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
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onOpenItem(item.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  gap: 12,
                  width: "100%",
                  textAlign: "left",
                  padding: 10,
                  background: "var(--color-neutral-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  style={{
                    width: 52,
                    height: 68,
                    flexShrink: 0,
                    borderRadius: "var(--radius-sm)",
                    objectFit: "cover",
                    background: "var(--color-border)",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{item.brand}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{item.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
