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

// Phase 2 (Myntra design-language pass, final pre-submission round): real
// e-commerce grid cards show the struck-through original price right next
// to the current one, not just a "X% off" pill — the pill alone under-uses
// space a real listing would use for a second, denser price signal. Reuses
// the same priceHistory data ComparisonStrip already draws its price box
// from; nothing new is fabricated.
function originalPrice(item: WishlistItem): string | null {
  if (!item.priceHistory || item.priceHistory.length < 2) return null;
  const first = item.priceHistory[0];
  const last = item.priceHistory[item.priceHistory.length - 1];
  if (first === last) return null;
  return `₹${first.toLocaleString("en-IN")}`;
}

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
  // Phase 1a fix: WishlistHome routes a "holding steady" item here with its
  // own honest hint — a stable price is real evidence, not a knowledge gap,
  // so it shouldn't read like the same "not enough evidence yet" copy a
  // genuinely-unknown item gets. Confidence data itself is untouched; this
  // only overrides what this one card says.
  hintOverride?: string;
}

export function DecisionCard({ item, hasSimilarItems, onReviewDecision, onCompareSimilar, hintOverride }: Props) {
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
        <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{item.price}</span>
          {originalPrice(item) && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-secondary)", textDecoration: "line-through" }}>
              {originalPrice(item)}
            </span>
          )}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <StockBadge state={item.stock} />
        <PriceSignalBadge item={item} />
        {item.addedToCartAt && (
          <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>In cart</span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "var(--color-ink-secondary)" }}>{hintOverride ?? decisionHint(item)}</p>

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
