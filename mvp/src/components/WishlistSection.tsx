import type { WishlistItem } from "../types";
import { ProductActionCard } from "./ProductActionCard";
import { StockBadge } from "./StockBadge";

// Phase 5 (docs/PHASE_PLAN.md): shared renderer for the three new sections
// (Back in Stock, Price Drop, Low Quantity) added above the untouched
// Out-of-Stock section. Reuses Phase 3's ProductActionCard rather than
// duplicating card markup — every card here gets Add to Cart + Buy Now,
// same as Discovery's grid. Confidence badge stays off, per the existing
// locked rule (WishlistCard's own comment).

interface Props {
  title: string;
  items: WishlistItem[];
  onOpenItem: (id: string) => void;
  onAddToCart: (id: string) => void;
  onBuyNow: (id: string) => void;
}

export function WishlistSection({ title, items, onOpenItem, onAddToCart, onBuyNow }: Props) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
        {title} ({items.length})
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md) var(--space-sm)" }}>
        {items.map((item) => (
          <ProductActionCard
            key={item.id}
            name={item.name}
            brand={item.brand}
            price={item.price}
            imageUrl={item.imageUrl}
            imageAlt={item.imageAlt}
            onOpen={() => onOpenItem(item.id)}
            stockBadge={<StockBadge state={item.stock} />}
            addedToCart={Boolean(item.addedToCartAt)}
            onAddToCart={() => onAddToCart(item.id)}
            onBuyNow={() => onBuyNow(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
