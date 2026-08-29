import { useMemo, useState } from "react";
import type { BrowseItem, Persona, WishlistItem } from "../types";
import { BROWSE_CATALOG } from "../../mock-data/browse-catalog";
import { TopNav } from "../components/TopNav";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";
import { ProductActionCard } from "../components/ProductActionCard";
import { AlternativeCompareSheet } from "../components/AlternativeCompareSheet";
import { Toast } from "../components/Toast";

// Phase G (docs/PHASE_PLAN_2.md): kept secondary — substitutes related to
// this persona's existing wishlist items, not generic browsing. Honest CTAs
// only (Save/Compare/Move to cart), no "Buy Now" anywhere.

interface Props {
  persona: Persona;
  items: WishlistItem[]; // this persona's current wishlist, used both for the banner and the similarity indicator
  onOpenItem: (id: string) => void;
  onToggleWishlist: (item: BrowseItem) => void;
  onMoveToCart: (item: BrowseItem) => void;
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

export function Alternatives({ persona, items, onOpenItem, onToggleWishlist, onMoveToCart }: Props) {
  const banner = useMemo(() => bannerCopy(items), [items]);
  const [compareFor, setCompareFor] = useState<{ browseItem: BrowseItem; relatedItem: WishlistItem } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastToken, setToastToken] = useState(0);

  // Phase J (docs/PHASE_PLAN_2.md): the heart toggle was silent — no
  // feedback that the tap registered. A brief toast closes that gap without
  // reviving the retired "stay and toast" cart button.
  function handleToggleWishlistWithToast(browseItem: BrowseItem, wasWishlisted: boolean) {
    onToggleWishlist(browseItem);
    setToastMessage(wasWishlisted ? `Removed ${browseItem.name} from wishlist` : `Saved ${browseItem.name} to wishlist`);
    setToastToken((t) => t + 1);
  }

  // Similarity precedence (unchanged from the prior round): check cart
  // first — if a same-category item is already in cart, that takes
  // priority over suggesting the shopper save another one.
  function relatedItemFor(browseItem: BrowseItem): WishlistItem | null {
    const sameCategory = items.filter((i) => i.category === browseItem.category && i.id !== browseItem.id);
    const inCart = sameCategory.find((i) => i.addedToCartAt);
    if (inCart) return inCart;
    if (sameCategory.length > 0) return sameCategory[0];
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopNav>Alternatives</TopNav>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", padding: "var(--space-md) 20px var(--space-lg)" }}>
        <SimulatedDataLabel />

        <div
          style={{
            padding: "var(--space-md)",
            borderRadius: "var(--radius-card)",
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
            const related = relatedItemFor(browseItem);

            return (
              <ProductActionCard
                key={browseItem.id}
                name={browseItem.name}
                brand={browseItem.brand}
                price={browseItem.price}
                imageUrl={browseItem.imageUrl}
                imageAlt={browseItem.imageAlt}
                isWishlisted={isWishlisted}
                onToggleWishlist={() => handleToggleWishlistWithToast(browseItem, isWishlisted)}
                onCompare={related ? () => setCompareFor({ browseItem, relatedItem: related }) : undefined}
                addedToCart={addedToCart}
                onMoveToCart={() => onMoveToCart(browseItem)}
                similarityIndicator={
                  related ? (
                    <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>
                      {related.addedToCartAt ? `Already similar to item in cart` : `Similar to ${related.name}`}
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {compareFor && (
        <AlternativeCompareSheet
          browseItem={compareFor.browseItem}
          relatedItem={compareFor.relatedItem}
          onClose={() => setCompareFor(null)}
          onOpenRelated={() => {
            onOpenItem(compareFor.relatedItem.id);
            setCompareFor(null);
          }}
        />
      )}

      {toastMessage && (
        <Toast key={toastToken} message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  );
}
