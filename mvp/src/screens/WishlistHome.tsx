import { useMemo, useState } from "react";
import type { Persona, WishlistGroup, WishlistItem } from "../types";
import { GroupFilterBar } from "../components/GroupFilterBar";
import { WishlistCard } from "../components/WishlistCard";
import { PersonaSwitcher } from "../components/PersonaSwitcher";
import { TopNav } from "../components/TopNav";

interface Props {
  items: WishlistItem[];
  personas: Persona[];
  activePersonaId: string;
  onPersonaChange: (id: string) => void;
  onOpenItem: (id: string) => void;
}

export function WishlistHome({ items, personas, activePersonaId, onPersonaChange, onOpenItem }: Props) {
  const [activeGroup, setActiveGroup] = useState<WishlistGroup | "all">("all");
  const [hideUnavailable, setHideUnavailable] = useState(false);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (activeGroup !== "all" && item.group !== activeGroup) return false;
      if (hideUnavailable && item.stock === "out_of_stock") return false;
      return true;
    });
  }, [items, activeGroup, hideUnavailable]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopNav>Your wishlist</TopNav>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          padding: "var(--space-md) 20px var(--space-lg)",
        }}
      >
        <PersonaSwitcher personas={personas} activeId={activePersonaId} onChange={onPersonaChange} />

        <GroupFilterBar
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          hideUnavailable={hideUnavailable}
          onToggleHideUnavailable={() => setHideUnavailable((v) => !v)}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {visible.length === 0 && (
            <p
              style={{
                fontSize: "var(--type-body-size)",
                lineHeight: "var(--type-body-leading)",
                color: "var(--color-ink-secondary)",
              }}
            >
              Nothing matches this filter.
            </p>
          )}
          {visible.map((item) => (
            <WishlistCard key={item.id} item={item} onOpen={() => onOpenItem(item.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
