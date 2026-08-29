import { useMemo, useState } from "react";
import type { Persona, WishlistItem } from "../types";
import { WISHLIST_BY_PERSONA } from "../../mock-data/personas";
import { OutOfStockSection } from "../components/OutOfStockSection";
import { DecisionSection } from "../components/DecisionSection";
import { CompareSimilarSheet } from "../components/CompareSimilarSheet";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";
import { TopNav } from "../components/TopNav";

interface Props {
  items: WishlistItem[];
  personas: Persona[];
  activePersonaId: string;
  onOpenItem: (id: string) => void;
  onRemoveItems: (ids: string[]) => void;
}

// Phase D (docs/PHASE_PLAN_2.md): regrouped around decision readiness
// rather than category/stock filters — using only fields already on
// WishlistItem, nothing invented. "Style ideas only" (bookmark_not_intent)
// is not a tag that exists anywhere in the data model (checked before
// building this — see docs/PHASE_PLAN_2.md's inspection notes), so per the
// phase's own instruction it's omitted rather than forced from `group`,
// which means something narrower already used elsewhere in this project.
// Out of stock keeps its exact pre-existing component/logic, untouched.
export function WishlistHome({ items, personas, activePersonaId, onOpenItem, onRemoveItems }: Props) {
  const activePersona = personas.find((p) => p.id === activePersonaId);
  const [similarFor, setSimilarFor] = useState<WishlistItem | null>(null);

  const inStockItems = items.filter((i) => i.stock !== "out_of_stock");
  const outOfStockItems = items.filter((i) => i.stock === "out_of_stock");

  const readyToDecide = useMemo(() => inStockItems.filter((i) => i.confidence === "high"), [inStockItems]);
  const needsMoreEvidence = useMemo(
    () => inStockItems.filter((i) => i.confidence === "medium" || i.confidence === "insufficient"),
    [inStockItems],
  );

  // Compact insight summary — counts only, plus an optional one-line next
  // step templated from real state (never fabricated): the oldest
  // ready-to-decide item not yet in cart, or failing that the oldest
  // needs-more-evidence item.
  const nextBestAction = useMemo(() => {
    const candidates = readyToDecide.filter((i) => !i.addedToCartAt);
    const pool = candidates.length > 0 ? candidates : needsMoreEvidence;
    if (pool.length === 0) return null;
    const oldest = pool.slice().sort((a, b) => new Date(a.wishlistedAt).getTime() - new Date(b.wishlistedAt).getTime())[0];
    return oldest;
  }, [readyToDecide, needsMoreEvidence]);

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
      <TopNav>
        Wishlist Intelligence <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, opacity: 0.6 }}>({items.length})</span>
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
            flexDirection: "column",
            gap: 6,
            padding: "var(--space-sm) var(--space-md)",
            background: "var(--color-thread-plum-dark)",
            borderRadius: "var(--radius-card)",
            color: "white",
          }}
        >
          <SimulatedDataLabel />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-card-title-size)" }}>
            {activePersona?.name}
          </span>
          <span style={{ fontSize: 12, opacity: 0.85 }}>{activePersona?.description}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-card)",
            background: "var(--color-neutral-bg)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-md)", fontSize: 13 }}>
            <span><strong>{readyToDecide.length}</strong> ready to decide</span>
            <span><strong>{needsMoreEvidence.length}</strong> need more evidence</span>
            <span><strong>{outOfStockItems.length}</strong> out of stock</span>
          </div>
          {nextBestAction && (
            <span style={{ fontSize: 12, color: "var(--color-ink-secondary)" }}>
              Next best move: review {nextBestAction.name}.
            </span>
          )}
        </div>

        <DecisionSection
          title="Ready to decide"
          items={readyToDecide}
          categoryCounts={categoryCounts}
          onOpenItem={onOpenItem}
          onCompareSimilar={setSimilarFor}
        />
        <DecisionSection
          title="Needs more evidence"
          items={needsMoreEvidence}
          categoryCounts={categoryCounts}
          onOpenItem={onOpenItem}
          onCompareSimilar={setSimilarFor}
        />

        {readyToDecide.length === 0 && needsMoreEvidence.length === 0 && outOfStockItems.length === 0 && (
          <p style={{ fontSize: "var(--type-body-size)", color: "var(--color-ink-secondary)" }}>
            Nothing in this wishlist yet.
          </p>
        )}

        <OutOfStockSection items={outOfStockItems} onRemove={onRemoveItems} />
      </div>

      {similarFor && (
        <CompareSimilarSheet
          sourceItem={similarFor}
          items={similarItems}
          onClose={() => setSimilarFor(null)}
          onOpenItem={onOpenItem}
        />
      )}
    </div>
  );
}
