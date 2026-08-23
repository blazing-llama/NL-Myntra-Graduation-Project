import type { WishlistItem } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { StockBadge } from "./StockBadge";

interface Props {
  item: WishlistItem;
  onOpen: () => void;
}

export function WishlistCard({ item, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "flex",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: 12,
        background: "var(--color-bone)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
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
          background: "var(--color-border)",
          objectFit: "cover",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>{item.name}</div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>{item.brand}</div>
        <div style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{item.price}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          <ConfidenceBadge level={item.confidence} />
          <StockBadge state={item.stock} />
          {item.addedToCartAt && (
            <span style={{ fontSize: 12, opacity: 0.6 }}>In cart — still wishlisted</span>
          )}
        </div>
      </div>
    </button>
  );
}
