import type { StockState } from "../types";

// Requirements #3/#4: stock/size availability surfaced in-list, not just on
// the PDP. Requirement #9: icon + label always with the colour.

const CONFIG: Record<StockState, { label: string; icon: string; fg: string; bg: string } | null> = {
  in_stock: null, // nothing to show — no urgency to manufacture where none exists
  low_stock: { label: "Low stock in your size", icon: "▲", fg: "var(--color-clay-rose)", bg: "var(--color-clay-rose-bg)" },
  back_in_stock: { label: "Back in stock", icon: "●", fg: "var(--color-moss)", bg: "var(--color-moss-bg)" },
  out_of_stock: { label: "Out of stock in your size", icon: "✕", fg: "var(--color-ink)", bg: "var(--color-border)" },
};

export function StockBadge({ state }: { state: StockState }) {
  const c = CONFIG[state];
  if (!c) return null;
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
        background: c.bg,
        color: c.fg,
      }}
    >
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>
  );
}
