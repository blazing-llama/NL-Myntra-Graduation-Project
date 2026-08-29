import type { WishlistItem } from "../types";

// Phase D (docs/PHASE_PLAN_2.md): preserves the price-history signal that
// used to drive its own "Price Drop" section, now inline on the card
// instead — computed the same way (oldest vs. newest point on file), never
// invented. Requirement #9: icon + label always travel with the colour.

export function PriceSignalBadge({ item }: { item: WishlistItem }) {
  const history = item.priceHistory;
  if (!history || history.length < 2) return null;

  const first = history[0];
  const last = history[history.length - 1];

  if (last < first) {
    const pct = Math.round(((first - last) / first) * 100);
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 999,
          background: "var(--color-moss-bg)",
          color: "var(--color-moss)",
        }}
      >
        <span aria-hidden="true">▼</span>
        Price drop ({pct}%)
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        background: "var(--color-neutral-bg)",
        color: "var(--color-ink-secondary)",
      }}
    >
      <span aria-hidden="true">—</span>
      Price stable
    </span>
  );
}
