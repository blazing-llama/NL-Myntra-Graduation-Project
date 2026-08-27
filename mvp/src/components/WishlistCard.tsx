import type { WishlistItem } from "../types";
import { StockBadge } from "./StockBadge";

// Confidence indicator deliberately NOT shown here — it belongs only on the
// item-detail screen (explicit product decision). Grid cards show identity
// (image/name/price) + availability only.

interface Props {
  item: WishlistItem;
  span: "wide" | "tall"; // asymmetric grid: alternates which cards run bigger
  hasSimilarItems: boolean; // round-2 QA item 2: hide the trigger rather than dead-end on a genuinely empty sheet
  onOpen: () => void;
  onShowSimilar: () => void;
}

export function WishlistCard({ item, span, hasSimilarItems, onOpen, onShowSimilar }: Props) {
  const aspectRatio = span === "wide" ? "4 / 3" : "3 / 4";
  // Organic shape: each card gets a slightly different corner treatment
  // rather than one uniform radius — alternates by a stable hash of id so
  // it doesn't reshuffle on every render.
  const asymmetricRadius = item.id.charCodeAt(item.id.length - 1) % 2 === 0
    ? "28px 14px 28px 14px"
    : "14px 28px 14px 28px";

  return (
    <div
      className="wishlist-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gridColumn: span === "wide" ? "span 2" : "span 1",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          textAlign: "left",
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          style={{
            width: "100%",
            aspectRatio,
            borderRadius: asymmetricRadius,
            border: "1px solid var(--color-border)",
            background: "var(--color-border)",
            objectFit: "cover",
          }}
        />
        <div style={{ padding: "8px 2px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>{item.brand}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{item.price}</span>
        </div>
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 2px 0", alignItems: "center" }}>
        <StockBadge state={item.stock} />
        {item.addedToCartAt && (
          <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>In cart</span>
        )}
        {hasSimilarItems && (
          <button
            type="button"
            onClick={onShowSimilar}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              color: "var(--color-thread-plum)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Similar items ›
          </button>
        )}
      </div>
    </div>
  );
}
