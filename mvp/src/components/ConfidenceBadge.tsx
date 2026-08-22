import type { ConfidenceLevel } from "../types";

// Requirement #9: colour is never the sole carrier of meaning — icon + label
// always travel with the colour.

const CONFIG: Record<ConfidenceLevel, { label: string; icon: string; bg: string; fg: string }> = {
  high: { label: "High confidence", icon: "✓", bg: "var(--color-moss-bg)", fg: "var(--color-moss)" },
  medium: { label: "Medium confidence", icon: "!", bg: "var(--color-ochre-bg)", fg: "var(--color-ochre)" },
  insufficient: {
    label: "Insufficient evidence",
    icon: "?",
    bg: "var(--color-border)",
    fg: "var(--color-ink)",
  },
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const c = CONFIG[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <span aria-hidden="true" style={{ fontWeight: 700 }}>
        {c.icon}
      </span>
      {c.label}
    </span>
  );
}
