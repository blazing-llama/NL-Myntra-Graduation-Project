import type { ComparisonRow } from "../types";

// The signature element (design spec Section B). This IS the deterministic-core
// output rendered directly — not decorative. Generalizes beyond fit (a price-
// history or occasion-match strip would use the same row shape).

export function ComparisonStrip({ rows }: { rows: ComparisonRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 15,
        background: "var(--color-bone)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
        >
          <span style={{ color: "var(--color-ink)", opacity: 0.65, letterSpacing: "0.04em" }}>
            {row.label}
          </span>
          <span style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span>{row.before}</span>
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              ──
            </span>
            <span
              style={{
                color: row.delta.startsWith("+") || row.delta.startsWith("-") ? "var(--color-thread-plum)" : undefined,
              }}
            >
              {row.delta}
            </span>
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              ──
            </span>
            <span style={{ fontWeight: 600 }}>{row.after}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
