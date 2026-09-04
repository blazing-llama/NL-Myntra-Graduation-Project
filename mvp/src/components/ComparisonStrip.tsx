import type { CSSProperties } from "react";
import type { ComparisonRow } from "../types";

// The signature element (design spec Section B). This IS the deterministic-core
// output rendered directly — not decorative. Generalizes beyond fit (a price-
// history or occasion-match strip would use the same row shape).

// Round 2 item 5: a subtle price-pulse sparkline alongside price-based rows.
// No background-color signaling — just the line's own shape communicates
// flat/up/down, kept as quiet as the rest of the deterministic-core output.
function PricePulse({ history }: { history: number[] }) {
  // Audit fix (round 3, item 7): a flat line (every point identical) isn't a
  // real signal — it was rendering even when nothing moved, alongside a
  // "value — 0% — value" row that just repeated the same number. Only draw
  // the sparkline when there's an actual trend to show.
  if (history.length < 2 || new Set(history).size < 2) return null;
  const width = 56;
  const height = 18;
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
      <polyline points={points} fill="none" stroke="var(--color-moss)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--color-ink-secondary)",
};

function pillStyle(bg: string, fg: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 999,
    fontFamily: "var(--font-body)",
    fontSize: 12,
    fontWeight: 700,
    background: bg,
    color: fg,
    flexShrink: 0,
  };
}

// Phase 1c (final pre-submission round): the old "TYPICAL PRICE" treatment —
// a monospace label plus a dash-delta-dash cluster — read like a debug
// readout, not a shopping price. Rebuilt on the standard e-commerce
// convention instead: struck-through original price, bold current price, a
// colored percentage-off pill. Locked palette only (no new hex values).
function PriceRow({ row, priceHistory }: { row: ComparisonRow; priceHistory?: number[] }) {
  const noRealRange = row.before === row.after;
  const isDrop = row.delta.startsWith("-");
  const isRise = row.delta.startsWith("+");
  const pctText = row.delta.replace(/^[+-]/, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelStyle}>Typical price</span>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
        {!noRealRange && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 15,
              color: "var(--color-ink-secondary)",
              textDecoration: "line-through",
            }}
          >
            {row.before}
          </span>
        )}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 21, fontWeight: 700, color: "var(--color-ink)" }}>
          {row.after}
        </span>
        {noRealRange && <span style={pillStyle("var(--color-neutral-bg)", "var(--color-ink-secondary)")}>Steady</span>}
        {!noRealRange && isDrop && <span style={pillStyle("var(--color-moss-bg)", "var(--color-moss)")}>{pctText} off</span>}
        {!noRealRange && isRise && <span style={pillStyle("var(--color-ochre-bg)", "var(--color-ochre)")}>{pctText} higher</span>}
        {!noRealRange && priceHistory && <PricePulse history={priceHistory} />}
      </div>
    </div>
  );
}

// Non-price rows (garment measurements: CHEST, LENGTH, BUST, SIZE...) don't
// take the strikethrough-price treatment — a chest measurement isn't "on
// sale" — but get the same font-and-label cleanup, plus a plain +/- delta
// pill instead of the old dash-delta-dash cluster.
function MeasurementRow({ row }: { row: ComparisonRow }) {
  const noRealRange = row.before === row.after;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelStyle}>{row.label}</span>
      {noRealRange ? (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: "var(--color-ink)" }}>{row.after}</span>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-ink-secondary)" }}>{row.before}</span>
          <span aria-hidden="true" style={{ opacity: 0.45, fontSize: 13 }}>
            →
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: "var(--color-ink)" }}>{row.after}</span>
          <span style={pillStyle("var(--color-clay-rose-bg)", "var(--color-thread-plum)")}>{row.delta}</span>
        </div>
      )}
    </div>
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
        background: "var(--color-bone)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {rows.map((row) =>
        row.label === "TYPICAL PRICE" ? (
          <PriceRow key={row.label} row={row} priceHistory={priceHistory} />
        ) : (
          <MeasurementRow key={row.label} row={row} />
        ),
      )}
    </div>
  );
}
