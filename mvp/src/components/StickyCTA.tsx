import type { ConfidenceLevel } from "../types";

// Requirement #5: primary action stays sticky/pinned during any decision or
// checkout-adjacent flow. Requirement #12: nothing else competes with it —
// no upsell, no secondary buttons crowding the bar.

interface Props {
  level: ConfidenceLevel;
  onAddToCart: () => void;
  addedToCart: boolean;
}

export function StickyCTA({ level, onAddToCart, addedToCart }: Props) {
  const label = addedToCart
    ? "In cart — still in your wishlist"
    : level === "insufficient"
      ? "Add to cart anyway"
      : "Add to cart";

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        background: "var(--color-bone)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={onAddToCart}
        style={{
          width: "100%",
          minHeight: "var(--tap-target-min)",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: addedToCart ? "var(--color-moss)" : "var(--color-thread-plum)",
          color: "white",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          transition: "var(--transition-fast)",
        }}
      >
        {label}
      </button>
      {level === "insufficient" && !addedToCart && (
        <p style={{ margin: "6px 0 0", fontSize: 12, textAlign: "center", opacity: 0.65 }}>
          Unendorsed — we don&apos;t have enough evidence to recommend for or against this.
        </p>
      )}
    </div>
  );
}
