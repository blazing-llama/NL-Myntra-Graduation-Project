import { useMemo, useState } from "react";
import type { BrowseItem, Persona, WishlistItem } from "../types";
import { BROWSE_CATALOG } from "../../mock-data/browse-catalog";
import { TopNav } from "../components/TopNav";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";
import { ProductActionCard } from "../components/ProductActionCard";
import { Toast } from "../components/Toast";

// Phase 3 (docs/PHASE_PLAN.md): genuinely new screen — the persona's
// shopping home after selection. Wishlist and cart become reachable via
// header icons rather than a strictly linear flow.

interface Props {
  persona: Persona;
  items: WishlistItem[]; // this persona's current wishlist, used both for the banner and the similarity indicator
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onToggleWishlist: (item: BrowseItem) => void;
  onAddToCart: (item: BrowseItem) => void;
  onBuyNow: (item: BrowseItem) => void;
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

// Banner copy is computed from this persona's real wishlist state, never
// hardcoded — a low-stock item takes priority (time-sensitive), then the
// longest-unbought item, then a style-idea suggestion.
function bannerCopy(items: WishlistItem[]): string {
  const lowStock = items.find((i) => i.stock === "low_stock");
  if (lowStock) return `Your ${lowStock.name} is running low in stock. Worth a decision soon.`;

  const unbought = items
    .filter((i) => !i.addedToCartAt)
    .slice()
    .sort((a, b) => new Date(a.wishlistedAt).getTime() - new Date(b.wishlistedAt).getTime());
  if (unbought.length > 0) {
    const oldest = unbought[0];
    return `You saved ${oldest.name} ${daysAgo(oldest.wishlistedAt)} days ago and haven't moved on it yet.`;
  }

  const styleIdea = items.find((i) => i.group === "style_ideas");
  if (styleIdea) return `You saved ${styleIdea.name} for style ideas. Here's more to browse.`;

  return "Here's what's new to browse.";
}

export function Discovery({ persona, items, onOpenWishlist, onOpenCart, onToggleWishlist, onAddToCart, onBuyNow }: Props) {
  const cartCount = items.filter((i) => i.addedToCartAt).length;
  const banner = useMemo(() => bannerCopy(items), [items]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastToken, setToastToken] = useState(0);

  function handleAddToCartWithToast(browseItem: BrowseItem) {
    onAddToCart(browseItem);
    setToastMessage(`Added ${browseItem.name} to cart`);
    setToastToken((t) => t + 1);
  }

  // Similarity precedence (Phase 3 spec): check cart first — if a same-
  // category item is already in cart, that takes priority over suggesting
  // the shopper save another one. Only fall back to a wishlist-similarity
  // message if nothing similar is in the cart. If neither, no indicator.
  function similarityFor(browseItem: BrowseItem): { kind: "cart" | "wishlist"; itemName: string } | null {
    const sameCategory = items.filter((i) => i.category === browseItem.category && i.id !== browseItem.id);
    const inCart = sameCategory.find((i) => i.addedToCartAt);
    if (inCart) return { kind: "cart", itemName: inCart.name };
    if (sameCategory.length > 0) return { kind: "wishlist", itemName: sameCategory[0].name };
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopNav
        trailing={
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`View wishlist, ${items.length} item${items.length === 1 ? "" : "s"}`}
              style={{
                minWidth: "var(--tap-target-min)",
                minHeight: "var(--tap-target-min)",
                border: "none",
                background: "transparent",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--color-thread-plum)",
              }}
            >
              ♡
            </button>
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`View cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              style={{
                position: "relative",
                minWidth: "var(--tap-target-min)",
                minHeight: "var(--tap-target-min)",
                border: "none",
                background: "transparent",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--color-thread-plum)",
              }}
            >
              🛍
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "var(--color-thread-plum)",
                    color: "white",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        }
      >
        Discover
      </TopNav>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", padding: "var(--space-md) 20px var(--space-lg)" }}>
        <SimulatedDataLabel />

        <div
          style={{
            padding: "var(--space-md)",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-thread-plum-dark)",
            color: "white",
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            For {persona.name}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: 15, lineHeight: 1.4 }}>{banner}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md) var(--space-sm)" }}>
          {BROWSE_CATALOG.map((browseItem) => {
            const isWishlisted = items.some((i) => i.id === browseItem.id);
            const addedToCart = items.some((i) => i.id === browseItem.id && i.addedToCartAt);
            const similarity = similarityFor(browseItem);

            return (
              <ProductActionCard
                key={browseItem.id}
                name={browseItem.name}
                brand={browseItem.brand}
                price={browseItem.price}
                imageUrl={browseItem.imageUrl}
                imageAlt={browseItem.imageAlt}
                isWishlisted={isWishlisted}
                onToggleWishlist={() => onToggleWishlist(browseItem)}
                addedToCart={addedToCart}
                onAddToCart={() => handleAddToCartWithToast(browseItem)}
                onBuyNow={() => onBuyNow(browseItem)}
                similarityIndicator={
                  similarity ? (
                    <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>
                      {similarity.kind === "cart"
                        ? `You already have something similar to ${similarity.itemName} in your cart`
                        : `Similar to ${similarity.itemName} in your wishlist`}
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {toastMessage && (
        <Toast key={toastToken} message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  );
}
