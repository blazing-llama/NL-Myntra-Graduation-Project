import type { WishlistItem } from "../types";
import { TopNav } from "../components/TopNav";

// Round 2 item 4: simple visibility into already-tracked add-to-cart state —
// deliberately no payment/checkout flow, just a list. Requirement #1 still
// holds: items here are NOT removed from the wishlist by being in the cart.

interface Props {
  items: WishlistItem[]; // already scoped to the active persona
  personaName: string;
  onBack: () => void;
  onOpenItem: (id: string) => void;
}

export function CartView({ items, personaName, onBack, onOpenItem }: Props) {
  const cartItems = items.filter((i) => i.addedToCartAt);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <TopNav
        leading={
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to wishlist"
            style={{
              background: "none",
              border: "none",
              color: "var(--color-thread-plum)",
              fontSize: 20,
              cursor: "pointer",
              minHeight: "var(--tap-target-min)",
              minWidth: "var(--tap-target-min)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: -8,
            }}
          >
            ←
          </button>
        }
      >
        Your cart <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, opacity: 0.6 }}>({cartItems.length})</span>
      </TopNav>

      <div style={{ padding: "var(--space-md) 20px var(--space-lg)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {/* QA item 4: cart is intentionally persona-scoped, not global — each
            persona is a distinct simulated shopper. Labelled explicitly so
            that reads as a design choice, not a bug, when switching personas. */}
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--color-ink-secondary)" }}>
          Cart for {personaName}
        </p>
        {cartItems.length === 0 ? (
          <p style={{ fontSize: "var(--type-body-size)", color: "var(--color-ink-secondary)" }}>
            Nothing added to cart yet — items you add still stay in your wishlist too.
          </p>
        ) : (
          cartItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenItem(item.id)}
              style={{
                display: "flex",
                gap: 12,
                width: "100%",
                textAlign: "left",
                padding: 12,
                background: "var(--color-bone)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                cursor: "pointer",
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.imageAlt}
                style={{
                  width: 64,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-border)",
                  objectFit: "cover",
                }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{item.brand}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{item.price}</span>
                <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>Still in your wishlist</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
