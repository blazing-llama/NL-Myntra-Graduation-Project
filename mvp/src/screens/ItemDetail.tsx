import type { WishlistItem } from "../types";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { ComparisonStrip } from "../components/ComparisonStrip";
import { NarrationBlock } from "../components/NarrationBlock";
import { WhyAmISeeingThis } from "../components/WhyAmISeeingThis";
import { StockBadge } from "../components/StockBadge";
import { StickyCTA } from "../components/StickyCTA";

interface Props {
  item: WishlistItem;
  onBack: () => void;
  onAddToCart: () => void;
}

export function ItemDetail({ item, onBack, onAddToCart }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--color-thread-plum)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: "var(--tap-target-min)",
          }}
        >
          ← Back to wishlist
        </button>

        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            background: "var(--color-border)",
            borderRadius: "var(--radius-lg)",
            objectFit: "cover",
          }}
        />

        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 4px" }}>{item.name}</h1>
          <div style={{ fontSize: 13, opacity: 0.65 }}>{item.brand}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, marginTop: 6 }}>{item.price}</div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ConfidenceBadge level={item.confidence} />
          <StockBadge state={item.stock} />
        </div>

        <ComparisonStrip rows={item.comparisonRows} />

        <NarrationBlock
          level={item.confidence}
          narration={item.narration}
          missingForHigherConfidence={item.missingForHigherConfidence}
          whatWouldHelp={item.whatWouldHelp}
        />

        <WhyAmISeeingThis trace={item.trace} />
      </div>

      <StickyCTA level={item.confidence} onAddToCart={onAddToCart} addedToCart={Boolean(item.addedToCartAt)} />
    </div>
  );
}
