import { useMemo, useState } from "react";
import type { Persona, WishlistGroup, WishlistItem } from "../types";
import { WISHLIST_BY_PERSONA } from "../../mock-data/personas";
import { GroupFilterBar } from "../components/GroupFilterBar";
import { CategoryChips } from "../components/CategoryChips";
import { WishlistCard } from "../components/WishlistCard";
import { OutOfStockSection } from "../components/OutOfStockSection";
import { WishlistSection } from "../components/WishlistSection";
import { SimilarItemsSheet } from "../components/SimilarItemsSheet";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";
import { TopNav } from "../components/TopNav";

interface Props {
  items: WishlistItem[];
  personas: Persona[];
  activePersonaId: string;
  onSwitchPersona: () => void;
  onOpenItem: (id: string) => void;
  onRemoveItems: (ids: string[]) => void;
  onOpenCart: () => void;
  onBackToDiscovery: () => void;
  onAddToCart: (id: string) => void;
  onBuyNow: (id: string) => void;
}

export function WishlistHome({
  items,
  personas,
  activePersonaId,
  onSwitchPersona,
  onOpenItem,
  onRemoveItems,
  onOpenCart,
  onBackToDiscovery,
  onAddToCart,
  onBuyNow,
}: Props) {
  const activePersona = personas.find((p) => p.id === activePersonaId);
  const [activeGroup, setActiveGroup] = useState<WishlistGroup | "all">("all");
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [similarFor, setSimilarFor] = useState<WishlistItem | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items],
  );

  const cartCount = items.filter((i) => i.addedToCartAt).length;

  const inStockItems = items.filter((i) => i.stock !== "out_of_stock");
  const outOfStockItems = items.filter((i) => i.stock === "out_of_stock");

  // Phase 5 (docs/PHASE_PLAN.md): three new sections, ABOVE the untouched
  // Out-of-Stock section, driven entirely by mock-data fields already on
  // WishlistItem (restock events, price history, low-stock flags) — nothing
  // invented. Featured items move OUT of the general editorial grid below,
  // so nothing is listed twice.
  const backInStockItems = useMemo(() => inStockItems.filter((i) => i.stock === "back_in_stock"), [inStockItems]);

  const priceDropItems = useMemo(() => {
    return inStockItems
      .filter((i) => i.priceHistory && i.priceHistory.length >= 2 && i.priceHistory[i.priceHistory.length - 1] < i.priceHistory[0])
      .sort((a, b) => {
        const dropPct = (h: number[]) => (h[0] - h[h.length - 1]) / h[0];
        return dropPct(b.priceHistory!) - dropPct(a.priceHistory!);
      });
  }, [inStockItems]);

  const lowQuantityItems = useMemo(() => inStockItems.filter((i) => i.stock === "low_stock"), [inStockItems]);

  const featuredIds = useMemo(
    () => new Set([...backInStockItems, ...priceDropItems, ...lowQuantityItems].map((i) => i.id)),
    [backInStockItems, priceDropItems, lowQuantityItems],
  );

  const visible = useMemo(() => {
    return inStockItems.filter((item) => {
      if (featuredIds.has(item.id)) return false;
      if (activeGroup !== "all" && item.group !== activeGroup) return false;
      if (activeCategory && item.category !== activeCategory) return false;
      return true;
    });
  }, [inStockItems, activeGroup, activeCategory, featuredIds]);

  // Round 2 item 6: never render the sheet with zero results. Try the same
  // persona's own wishlist first (most relevant — same shopper's context);
  // if nothing else there shares the category, broaden to the same category
  // across every persona's mock wishlist. Never broadens to a DIFFERENT
  // category — a jacket's fallback is still jackets, never jeans.
  const similarItems = useMemo(() => {
    if (!similarFor) return [];
    const withinPersona = items.filter((i) => i.category === similarFor.category && i.id !== similarFor.id);
    if (withinPersona.length > 0) return withinPersona;

    const allItems = Object.values(WISHLIST_BY_PERSONA).flat();
    return allItems.filter((i) => i.category === similarFor.category && i.id !== similarFor.id);
  }, [similarFor, items]);

  // QA item 2: some categories are genuinely singletons across the whole
  // 30-item set (e.g. "Jeans" — only Wide-Leg Jeans has it). For those, no
  // fallback broadening can ever produce a real match — hide the trigger
  // instead of showing a dead-end sheet or inventing a fake match.
  const categoryCounts = useMemo(() => {
    const allItems = Object.values(WISHLIST_BY_PERSONA).flat();
    const counts: Record<string, number> = {};
    for (const i of allItems) counts[i.category] = (counts[i.category] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopNav
        leading={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={onBackToDiscovery}
              aria-label="Back to Discover"
              style={{
                background: "none",
                border: "none",
                color: "var(--color-thread-plum)",
                fontSize: 20,
                cursor: "pointer",
                minHeight: "var(--tap-target-min)",
                minWidth: "var(--tap-target-min)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -8,
              }}
            >
              ←
            </button>
            {cartCount > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`View cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 24,
                  height: 24,
                  borderRadius: 999,
                  background: "var(--color-thread-plum)",
                  color: "white",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "0 6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🛍 {cartCount}
              </button>
            )}
          </div>
        }
      >
        Your wishlist <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, opacity: 0.6 }}>({items.length})</span>
      </TopNav>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          padding: "var(--space-md) 20px var(--space-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            padding: "var(--space-sm) var(--space-md)",
            background: "var(--color-thread-plum-dark)",
            borderRadius: "var(--radius-xl)",
            color: "white",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SimulatedDataLabel />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
              {activePersona?.name}
            </span>
            <span style={{ fontSize: 12, opacity: 0.85, maxWidth: 240 }}>{activePersona?.description}</span>
          </div>
          <button
            type="button"
            onClick={onSwitchPersona}
            style={{
              flexShrink: 0,
              minHeight: "var(--tap-target-min)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(255,255,255,0.4)",
              padding: "0 12px",
              fontSize: 13,
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Switch
          </button>
        </div>

        <WishlistSection title="Back in Stock" items={backInStockItems} onOpenItem={onOpenItem} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
        <WishlistSection title="Price Drop" items={priceDropItems} onOpenItem={onOpenItem} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
        <WishlistSection title="Low Quantity" items={lowQuantityItems} onOpenItem={onOpenItem} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />

        <CategoryChips categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />

        <GroupFilterBar
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          hideUnavailable={hideUnavailable}
          onToggleHideUnavailable={() => setHideUnavailable((v) => !v)}
        />

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

        {/* Asymmetric editorial grid: a 2-column base grid where every 3rd
            card runs "wide" (spans both columns, shorter aspect ratio),
            breaking the grid out of a uniform rhythm without going fully
            masonry (which fights the 390px mobile-first frame). */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-md) var(--space-sm)",
          }}
        >
          {visible.map((item, i) => (
            <WishlistCard
              key={item.id}
              item={item}
              span={i % 3 === 2 ? "wide" : "tall"}
              hasSimilarItems={(categoryCounts[item.category] ?? 0) > 1}
              onOpen={() => onOpenItem(item.id)}
              onShowSimilar={() => setSimilarFor(item)}
            />
          ))}
        </div>

        {!hideUnavailable && <OutOfStockSection items={outOfStockItems} onRemove={onRemoveItems} />}
      </div>

      {similarFor && (
        <SimilarItemsSheet
          sourceItem={similarFor}
          items={similarItems}
          onClose={() => setSimilarFor(null)}
          onOpenItem={onOpenItem}
        />
      )}
    </div>
  );
}
