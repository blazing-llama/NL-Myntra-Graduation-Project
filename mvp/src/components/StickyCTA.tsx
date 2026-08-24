import { useState } from "react";
import type { ConfidenceLevel } from "../types";

// Requirement #5: primary action stays sticky/pinned during any decision or
// checkout-adjacent flow. Requirement #12: nothing else competes with it —
// no upsell, no secondary buttons crowding the bar.
//
// Tactile button shadow + opacity-only hover/active state: treatment
// borrowed from fashion-ecommerce-design-spec.md Theme A. The shadow's
// colors are effect-only (highlight/ring/drop) and apply unchanged on top
// of the locked Thread Plum / Moss fills.

interface Props {
  level: ConfidenceLevel;
  onAddToCart: () => void;
  addedToCart: boolean;
}

export function StickyCTA({ level, onAddToCart, addedToCart }: Props) {
  const [pressed, setPressed] = useState(false);

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
        padding: "var(--space-sm) var(--space-md) calc(var(--space-sm) + env(safe-area-inset-bottom))",
        background: "var(--color-bone)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={onAddToCart}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          width: "100%",
          minHeight: "var(--tap-target-min)",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: addedToCart ? "var(--color-moss)" : "var(--color-thread-plum)",
          color: "white",
          fontSize: "var(--type-body-size)",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "var(--shadow-tactile-button)",
          opacity: pressed ? 0.8 : 1,
          transition: `opacity var(--transition-fast)`,
        }}
      >
        {label}
      </button>
      {level === "insufficient" && !addedToCart && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            textAlign: "center",
            color: "var(--color-ink-secondary)",
          }}
        >
          Unendorsed — we don&apos;t have enough evidence to recommend for or against this.
        </p>
      )}
    </div>
  );
}
