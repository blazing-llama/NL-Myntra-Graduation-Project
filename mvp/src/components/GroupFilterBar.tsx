import type { WishlistGroup } from "../types";

// Requirement #2: items groupable (Buying soon / Style ideas) — operationalizes
// H2 (intent vs. bookmark) as a product feature. Requirement #3: filterable
// by current size/stock availability.

interface Props {
  activeGroup: WishlistGroup | "all";
  onGroupChange: (g: WishlistGroup | "all") => void;
  hideUnavailable: boolean;
  onToggleHideUnavailable: () => void;
}

const GROUPS: Array<{ id: WishlistGroup | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "buying_soon", label: "Buying soon" },
  { id: "style_ideas", label: "Style ideas" },
];

export function GroupFilterBar({ activeGroup, onGroupChange, hideUnavailable, onToggleHideUnavailable }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {GROUPS.map((g) => {
          const active = g.id === activeGroup;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onGroupChange(g.id)}
              aria-pressed={active}
              style={{
                minHeight: "var(--tap-target-min)",
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--color-thread-plum)" : "var(--color-border)"}`,
                background: active ? "var(--color-thread-plum)" : "transparent",
                color: active ? "white" : "var(--color-ink)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={hideUnavailable} onChange={onToggleHideUnavailable} />
        Hide items out of stock in my size
      </label>
    </div>
  );
}
