import type { WishlistItem } from "../types";
import { TopNav } from "../components/TopNav";
import { ProductImage } from "../components/ProductImage";

// Round 2 item 4: simple visibility into already-tracked add-to-cart state —
// deliberately no payment/checkout flow, just a list. Requirement #1 still
// holds: items here are NOT removed from the wishlist by being in the cart.

interface Props {
  items: WishlistItem[]; // already scoped to the active persona
  personaName: string;
  onOpenItem: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
}

// Audit fix (round 3, item 5): prices are simple "₹1,799"-style strings on
// WishlistItem, not numbers — parsed the same way CompareSimilarSheet/
// AlternativeCompareSheet already parse price strings elsewhere in this
// codebase, then summed and reformatted the same way their price-diff
// labels do (₹ + en-IN grouping).
function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Phase A (docs/PHASE_PLAN_2.md): the persistent TabBar now handles
// navigation back to Wishlist/Alternatives, so this screen no longer needs
// its own back arrow.
export function CartView({ items, personaName, onOpenItem, onRemoveFromCart }: Props) {
  const cartItems = items.filter((i) => i.addedToCartAt);
  const subtotal = cartItems.reduce((sum, i) => sum + parsePrice(i.price), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <TopNav>
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
          <>
            {cartItems.map((item) => (
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
                <button
                  type="button"
                  onClick={() => onOpenItem(item.id)}
                  style={{
                    display: "flex",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    style={{
                      width: 64,
                      height: 80,
                      flexShrink: 0,
                      borderRadius: "var(--radius-card)",
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
                {/* Audit fix (round 3, item 5): the only way off this screen used
                    to be back into Item Decision, whose own CTA just
                    re-navigated here instead of removing anything — no actual
                    remove path existed. This clears addedToCartAt only; the
                    item stays wishlisted, same contract as everywhere else. */}
                <button
                  type="button"
                  onClick={() => onRemoveFromCart(item.id)}
                  style={{
                    alignSelf: "flex-start",
                    minHeight: "var(--tap-target-min)",
                    padding: "0 14px",
                    borderRadius: "var(--radius-card)",
                    border: "1px solid var(--color-border-interactive)",
                    background: "transparent",
                    color: "var(--color-ink-secondary)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove from cart
                </button>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
                paddingTop: 12,
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--color-ink-secondary)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
