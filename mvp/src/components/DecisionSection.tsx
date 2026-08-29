import type { WishlistItem } from "../types";
import { DecisionCard } from "./DecisionCard";

interface Props {
  title: string;
  items: WishlistItem[];
  categoryCounts: Record<string, number>;
  onOpenItem: (id: string) => void;
  onCompareSimilar: (item: WishlistItem) => void;
}

export function DecisionSection({ title, items, categoryCounts, onOpenItem, onCompareSimilar }: Props) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
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
          />
        ))}
      </div>
    </div>
  );
}
