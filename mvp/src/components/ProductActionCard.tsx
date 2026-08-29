import type { ReactNode } from "react";

// Phase G (docs/PHASE_PLAN_2.md): Alternatives' card, honest 3-CTA set only
// — Save (heart), Compare (only when there's something to compare against),
// Move to cart (add + navigate, the same behavior as everywhere else in
// this app; no separate "stay and toast" add-to-cart button anymore, and no
// "Buy Now" label). Confidence badge deliberately never appears here,
// matching the Wishlist Intelligence grid's own locked rule.

interface Props {
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  onOpen?: () => void;
  similarityIndicator?: ReactNode;
  isWishlisted?: boolean; // heart state; omitted (undefined) hides the heart entirely
  onToggleWishlist?: () => void;
  onCompare?: () => void; // shown only when there's a related wishlist item to compare against
  addedToCart: boolean;
  onMoveToCart: () => void;
}

export function ProductActionCard({
  name,
  brand,
  price,
  imageUrl,
  imageAlt,
  onOpen,
  similarityIndicator,
  isWishlisted,
  onToggleWishlist,
  onCompare,
  addedToCart,
  onMoveToCart,
}: Props) {
  return (
    <div
      className="wishlist-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
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
              borderRadius: "var(--radius-card)",
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

      {similarityIndicator}

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        {onCompare && (
          <button
            type="button"
            onClick={onCompare}
            style={{
              minHeight: 36,
              borderRadius: "var(--radius-card)",
              border: "none",
              background: "var(--color-clay-rose-bg)",
              color: "var(--color-thread-plum)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Compare
          </button>
        )}
        <button
          type="button"
          onClick={onMoveToCart}
          style={{
            minHeight: 36,
            borderRadius: "var(--radius-card)",
            border: "none",
            background: addedToCart ? "var(--color-moss)" : "var(--color-thread-plum)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-tactile-button)",
          }}
        >
          {addedToCart ? "In cart" : "Move to cart"}
        </button>
      </div>
    </div>
  );
}
