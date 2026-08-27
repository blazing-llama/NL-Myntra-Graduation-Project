interface Props {
  categories: string[];
  activeCategory: string | null;
  onChange: (category: string | null) => void;
}

// Circular per-persona category chips, scoped to whatever categories that
// persona's own items actually cover — not a global fixed taxonomy.
export function CategoryChips({ categories, activeCategory, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 2px 6px" }}>
      <CategoryChip label="All" active={activeCategory === null} onClick={() => onChange(null)} />
      {categories.map((c) => (
        <CategoryChip key={c} label={c} active={activeCategory === c} onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        minHeight: 56,
        minWidth: 56,
        borderRadius: "50%",
        border: `1.5px solid ${active ? "var(--color-thread-plum)" : "var(--color-border)"}`,
        background: active ? "var(--color-thread-plum)" : "var(--color-bone)",
        color: active ? "white" : "var(--color-ink)",
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        lineHeight: 1.15,
        transition: `background var(--transition-fast), border-color var(--transition-fast)`,
      }}
    >
      {label}
    </button>
  );
}
