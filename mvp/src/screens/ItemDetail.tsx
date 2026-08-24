import type { WishlistItem } from "../types";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { ComparisonStrip } from "../components/ComparisonStrip";
import { NarrationBlock } from "../components/NarrationBlock";
import { WhyAmISeeingThis } from "../components/WhyAmISeeingThis";
import { WhyNowBadge } from "../components/WhyNowBadge";
import { StockBadge } from "../components/StockBadge";
import { StickyCTA } from "../components/StickyCTA";
import { TopNav } from "../components/TopNav";

interface Props {
  item: WishlistItem;
  personaId: string;
  onBack: () => void;
  onAddToCart: () => void;
}

export function ItemDetail({ item, personaId, onBack, onAddToCart }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <TopNav
        leading={
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to wishlist"
            style={{
              background: "none",
              border: "none",
              color: "var(--color-thread-plum)",
              fontSize: 20,
              cursor: "pointer",
              minHeight: "var(--tap-target-min)",
              minWidth: "var(--tap-target-min)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: -8,
            }}
          >
            ←
          </button>
        }
      >
        {item.name}
      </TopNav>

      <div
        style={{
          padding: "var(--space-md) 20px var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          flex: 1,
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            background: "var(--color-border)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "inset 0 0 0 1px rgba(33, 29, 27, 0.06)",
            objectFit: "cover",
          }}
        />

        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--type-hero-size)",
              fontWeight: "var(--type-hero-weight)",
              lineHeight: "var(--type-hero-leading)",
              letterSpacing: "var(--type-hero-tracking)",
              margin: "0 0 6px",
            }}
          >
            {item.name}
          </h1>
          <div style={{ fontSize: 13, color: "var(--color-ink-secondary)" }}>{item.brand}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, marginTop: 6 }}>{item.price}</div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ConfidenceBadge level={item.confidence} />
          <StockBadge state={item.stock} />
        </div>

        <WhyNowBadge item={item} personaId={personaId} />

        <ComparisonStrip rows={item.comparisonRows} />

        <NarrationBlock
          level={item.confidence}
          narration={item.narration}
          missingForHigherConfidence={item.missingForHigherConfidence}
          whatWouldHelp={item.whatWouldHelp}
        />

        <WhyAmISeeingThis trace={item.trace} itemId={item.id} personaId={personaId} />
      </div>

      <StickyCTA level={item.confidence} onAddToCart={onAddToCart} addedToCart={Boolean(item.addedToCartAt)} />
    </div>
  );
}
