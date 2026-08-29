import { useState } from "react";
import type { WishlistItem } from "../types";
import { ProductImage } from "./ProductImage";

// Out-of-stock items get their own dedicated section with a bulk "Remove"
// action, not just an inline badge buried in the main grid.

interface Props {
  items: WishlistItem[];
  onRemove: (ids: string[]) => void;
}

export function OutOfStockSection({ items, onRemove }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (items.length === 0) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function removeSelected() {
    onRemove(Array.from(selected));
    setSelected(new Set());
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        padding: "var(--space-md)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-neutral-bg)",
        border: "1px dashed var(--color-border)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
            Out of stock ({items.length})
          </span>
        <button
          type="button"
          onClick={removeSelected}
          disabled={selected.size === 0}
          style={{
            minHeight: "var(--tap-target-min)",
            padding: "0 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-thread-plum)",
            background: selected.size === 0 ? "transparent" : "var(--color-thread-plum)",
            color: selected.size === 0 ? "var(--color-thread-plum)" : "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: selected.size === 0 ? "not-allowed" : "pointer",
            opacity: selected.size === 0 ? 0.5 : 1,
          }}
        >
          Remove {selected.size > 0 ? `(${selected.size})` : ""}
        </button>
        </div>
        <span style={{ fontSize: 11, color: "var(--color-ink-secondary)" }}>
          Check the items you want to remove
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <label
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bone)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              aria-label={`Select ${item.name} to remove`}
              style={{
                minWidth: 22,
                minHeight: 22,
                width: 22,
                height: 22,
                accentColor: "var(--color-thread-plum)",
                border: "1.5px solid var(--color-border-interactive)",
                borderRadius: 4,
                flexShrink: 0,
                cursor: "pointer",
              }}
            />
            <ProductImage
              src={item.imageUrl}
              alt={item.imageAlt}
              style={{
                width: 40,
                height: 52,
                objectFit: "cover",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-border)",
                flexShrink: 0,
                opacity: 0.6,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{item.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>{item.price}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
