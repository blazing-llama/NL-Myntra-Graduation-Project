import type { WishlistItem } from "../types";
import { DecisionCard } from "./DecisionCard";

interface Props {
  title: string;
  items: WishlistItem[];
  categoryCounts: Record<string, number>;
  onOpenItem: (id: string) => void;
  onCompareSimilar: (item: WishlistItem) => void;
  hintOverride?: string;
  // Phase 1b (visual priority audit): every section used the exact same
  // neutral heading style, so nothing actually signalled "Ready to decide"
  // as the most important one beyond render order. A small Moss dot — the
  // same colour ConfidenceBadge already uses for "high" — ties this section
  // to that same "resolved" meaning instead of adding a new colour.
  accent?: boolean;
}

export function DecisionSection({ title, items, categoryCounts, onOpenItem, onCompareSimilar, hintOverride, accent }: Props) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
        {accent && (
          <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: "var(--color-moss)", flexShrink: 0 }} />
        )}
        {title} ({items.length})
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md) var(--space-sm)" }}>
        {items.map((item) => (
          <DecisionCard
            key={item.id}
            item={item}
            hasSimilarItems={(categoryCounts[item.category] ?? 0) > 1}
            onReviewDecision={() => onOpenItem(item.id)}
            onCompareSimilar={() => onCompareSimilar(item)}
            hintOverride={hintOverride}
          />
        ))}
      </div>
    </div>
  );
}
