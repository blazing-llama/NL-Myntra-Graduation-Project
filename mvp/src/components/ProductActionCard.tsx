import type { ReactNode } from "react";

// Phase 3 (docs/PHASE_PLAN.md): the shared card used by the Browse/Discovery
// grid and, per Phase 5, reused as-is (not duplicated) for every section of
// the restructured wishlist. Confidence badge deliberately never appears
// here, matching WishlistCard's existing locked rule — that indicator only
// belongs on the item-detail screen.

interface Props {
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  onOpen?: () => void;
  stockBadge?: ReactNode; // wishlist-section reuse only; Browse cards omit this
  similarityIndicator?: ReactNode; // Browse-only
  isWishlisted?: boolean; // heart state; omitted (undefined) hides the heart entirely
  onToggleWishlist?: () => void;
  addedToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductActionCard({
  name,
  brand,
  price,
  imageUrl,
  imageAlt,
  onOpen,
  stockBadge,
  similarityIndicator,
  isWishlisted,
  onToggleWishlist,
  addedToCart,
  onAddToCart,
  onBuyNow,
}: Props) {
  return (
    <div
      className="wishlist-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "var(--space-sm)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        background: "var(--color-bone)",
      }}
    >
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          style={{
            display: "block",
            width: "100%",
            padding: 0,
            background: "transparent",
            border: "none",
            cursor: onOpen ? "pointer" : "default",
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-border)",
              objectFit: "cover",
            }}
          />
        </button>
        {isWishlisted !== undefined && onToggleWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "none",
              background: "rgba(246, 241, 234, 0.9)",
              color: isWishlisted ? "var(--color-clay-rose)" : "var(--color-ink-secondary)",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow-tactile-button)",
            }}
          >
            <span aria-hidden="true">{isWishlisted ? "♥" : "♡"}</span>
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.25 }}>{name}</span>
        <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>{brand}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{price}</span>
      </div>

      {stockBadge}
      {similarityIndicator}

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        <button
          type="button"
          onClick={onAddToCart}
          style={{
            minHeight: 36,
            borderRadius: "var(--radius-sm)",
            border: `1px solid var(--color-thread-plum)`,
            background: addedToCart ? "var(--color-neutral-bg)" : "transparent",
            color: "var(--color-thread-plum)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {addedToCart ? "In cart" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          style={{
            minHeight: 36,
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--color-thread-plum)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-tactile-button)",
          }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
