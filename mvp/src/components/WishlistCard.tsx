import { useState } from "react";
import type { WishlistItem } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { StockBadge } from "./StockBadge";

interface Props {
  item: WishlistItem;
  onOpen: () => void;
}

export function WishlistCard({ item, onOpen }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: 12,
        background: "var(--color-bone)",
        border: `1px solid ${hovered ? "var(--color-border-interactive)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-xl)",
        cursor: "pointer",
        transition: `border-color var(--transition-fast)`,
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
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-card-title-size)",
            fontWeight: "var(--type-card-title-weight)",
            lineHeight: "var(--type-card-title-leading)",
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{item.brand}</div>
        <div style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{item.price}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          <ConfidenceBadge level={item.confidence} />
          <StockBadge state={item.stock} />
          {item.addedToCartAt && (
            <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>In cart — still wishlisted</span>
          )}
        </div>
      </div>
    </button>
  );
}
