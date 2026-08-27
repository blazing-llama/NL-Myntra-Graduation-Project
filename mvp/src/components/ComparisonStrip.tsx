import type { ComparisonRow } from "../types";

// The signature element (design spec Section B). This IS the deterministic-core
// output rendered directly — not decorative. Generalizes beyond fit (a price-
// history or occasion-match strip would use the same row shape).

// Round 2 item 5: a subtle price-pulse sparkline alongside price-based rows.
// No background-color signaling — just the line's own shape communicates
// flat/up/down, kept as quiet as the rest of the deterministic-core output.
function PricePulse({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const width = 64;
  const height = 20;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: 0.7 }}
    >
      <polyline points={points} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  rows: ComparisonRow[];
  priceHistory?: number[];
}

export function ComparisonStrip({ rows, priceHistory }: Props) {
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
      {rows.map((row) => {
        const isPriceRow = row.label === "TYPICAL PRICE";
        return (
          <div
            key={row.label}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span style={{ color: "var(--color-ink)", opacity: 0.65, letterSpacing: "0.04em" }}>
              {row.label}
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
              {isPriceRow && priceHistory && <PricePulse history={priceHistory} />}
            </span>
          </div>
        );
      })}
    </div>
  );
}
