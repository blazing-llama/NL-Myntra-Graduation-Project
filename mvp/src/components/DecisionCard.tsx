import type { WishlistItem } from "../types";
import { StockBadge } from "./StockBadge";
import { PriceSignalBadge } from "./PriceSignalBadge";
import { ProductImage } from "./ProductImage";

// Phase D (docs/PHASE_PLAN_2.md): the Wishlist Intelligence card structure —
// distinct from ProductActionCard (which is a cart-action card for
// Alternatives/Compare). This card's job is to get a shopper INTO the
// decision, not to transact directly from the grid: primary CTA opens the
// Item Decision Page, secondary CTA opens Compare Similar. No confidence
// badge here — that stays detail-page-only per the existing locked rule.

function decisionHint(item: WishlistItem): string {
  if (item.confidence === "high") return "Enough evidence to make a confident call.";
  if (item.confidence === "medium") return "Worth a second look before deciding.";
  return "Not enough evidence yet for a confident call.";
}

interface Props {
  item: WishlistItem;
  hasSimilarItems: boolean;
  onReviewDecision: () => void;
  onCompareSimilar: () => void;
}

export function DecisionCard({ item, hasSimilarItems, onReviewDecision, onCompareSimilar }: Props) {
  return (
    <div className="wishlist-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        onClick={onReviewDecision}
        style={{ display: "block", width: "100%", padding: 0, background: "transparent", border: "none", cursor: "pointer" }}
      >
        <ProductImage
          src={item.imageUrl}
          alt={item.imageAlt}
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            borderRadius: "var(--radius-card)",
            background: "var(--color-border)",
            objectFit: "cover",
          }}
        />
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>{item.brand}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.25 }}>{item.name}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{item.price}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <StockBadge state={item.stock} />
        <PriceSignalBadge item={item} />
        {item.addedToCartAt && (
          <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>In cart</span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "var(--color-ink-secondary)" }}>{decisionHint(item)}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        <button
          type="button"
          onClick={onReviewDecision}
          style={{
            minHeight: "var(--tap-target-min)",
            borderRadius: "var(--radius-card)",
            border: "none",
            background: "var(--color-thread-plum)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-tactile-button)",
          }}
        >
          Review decision
        </button>
        {hasSimilarItems && (
          <button
            type="button"
            onClick={onCompareSimilar}
            style={{
              minHeight: "var(--tap-target-min)",
              borderRadius: "var(--radius-card)",
              border: "none",
              background: "var(--color-neutral-bg)",
              color: "var(--color-ink)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Compare similar
          </button>
        )}
      </div>
    </div>
  );
}
