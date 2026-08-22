import { useMemo, useState } from "react";
import type { Persona, WishlistGroup, WishlistItem } from "../types";
import { GroupFilterBar } from "../components/GroupFilterBar";
import { WishlistCard } from "../components/WishlistCard";
import { PersonaSwitcher } from "../components/PersonaSwitcher";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0 }}>Your wishlist</h1>

      <PersonaSwitcher personas={personas} activeId={activePersonaId} onChange={onPersonaChange} />

      <GroupFilterBar
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        hideUnavailable={hideUnavailable}
        onToggleHideUnavailable={() => setHideUnavailable((v) => !v)}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.length === 0 && (
          <p style={{ fontSize: 14, opacity: 0.65 }}>Nothing matches this filter.</p>
        )}
        {visible.map((item) => (
          <WishlistCard key={item.id} item={item} onOpen={() => onOpenItem(item.id)} />
        ))}
      </div>
    </div>
  );
}
