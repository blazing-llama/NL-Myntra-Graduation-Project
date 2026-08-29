import { useState } from "react";
import { PERSONAS, WISHLIST_BY_PERSONA } from "../mock-data/personas";
import { PersonaPicker } from "./screens/PersonaPicker";
import { Alternatives } from "./screens/Alternatives";
import { WishlistHome } from "./screens/WishlistHome";
import { ItemDetail } from "./screens/ItemDetail";
import { CartView } from "./screens/CartView";
import { TabBar, type TabScreen } from "./components/TabBar";
import type { BrowseItem, WishlistItem } from "./types";
import { logEvent } from "./lib/logEvent";

// requirement #1: adding to cart never removes the item from the wishlist —
// modelled here as setting addedToCartAt on the same item, never deleting it.

// Phase A (docs/PHASE_PLAN_2.md): Wishlist is the primary experience —
// persona select lands here directly. Alternatives (formerly Discovery)
// and Cart are reachable secondary screens via the persistent TabBar.
type Screen = TabScreen;

// Phase 3: promotes a Browse card into a real WishlistItem the moment a
// shopper hearts it. Honestly labelled as having no research trace yet —
// this is a fresh save, not something the discovery engine has evidence on.
function toWishlistItem(browseItem: BrowseItem): WishlistItem {
  return {
    id: browseItem.id,
    name: browseItem.name,
    brand: browseItem.brand,
    category: browseItem.category,
    imageUrl: browseItem.imageUrl,
    imageAlt: browseItem.imageAlt,
    price: browseItem.price,
    group: "style_ideas",
    wishlistedAt: new Date().toISOString(),
    stock: "in_stock",
    restockedAt: null,
    addedToCartAt: null,
    confidence: "insufficient",
    comparisonRows: [],
    narration: "",
    whatWouldHelp: "Saved from Browse, with no research trace on file yet.",
    trace: { findingId: "BROWSE", summary: "Saved directly from Browse, not from a wishlist-resolution finding." },
  };
}

export default function App() {
  // null = no persona chosen yet -> PersonaPicker is the first screen on load.
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("wishlist");

  function handlePersonaSelect(id: string) {
    setPersonaId(id);
    setItems(WISHLIST_BY_PERSONA[id]);
    setOpenItemId(null);
    setScreen("wishlist");
  }

  function handleSwitchPersona() {
    setPersonaId(null);
    setOpenItemId(null);
    setScreen("wishlist");
  }

  // Phase E (docs/PHASE_PLAN_2.md): the Item Decision Page's sticky CTA is
  // always "Move to cart" now — adds the item and navigates straight to
  // Cart, logged as buy_now (the honest event type for an add+navigate
  // action, same contract as Discovery/Alternatives' equivalent). There is
  // no more "stay on this screen" add-to-cart path from the decision page.
  function handleMoveToCart(itemId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: new Date().toISOString() } : i)),
    );
    if (personaId) logEvent(itemId, "buy_now", personaId);
    setOpenItemId(null);
    setScreen("cart");
  }

  function handleToggleWishlist(browseItem: BrowseItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === browseItem.id);
      return exists ? prev.filter((i) => i.id !== browseItem.id) : [...prev, toWishlistItem(browseItem)];
    });
  }

  // Phase G (docs/PHASE_PLAN_2.md): Alternatives' sole cart action —
  // consolidated from the old Add to Cart/Buy Now pair into one honest
  // "Move to cart" (add + navigate), matching the Item Decision Page.
  function handleAlternativeMoveToCart(browseItem: BrowseItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === browseItem.id);
      const base = exists ? prev : [...prev, toWishlistItem(browseItem)];
      return base.map((i) => (i.id === browseItem.id ? { ...i, addedToCartAt: new Date().toISOString() } : i));
    });
    if (personaId) logEvent(browseItem.id, "buy_now", personaId);
    setScreen("cart");
  }

  function handleRemoveItems(ids: string[]) {
    const idSet = new Set(ids);
    setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
  }

  const openItem = items.find((i) => i.id === openItemId) ?? null;

  return (
    <div
      style={{
        maxWidth: "var(--frame-width)",
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--color-bone)",
        boxShadow: "0 0 0 1px var(--color-border)",
      }}
    >
      {!personaId ? (
        <div key="picker" className="screen-transition-enter">
          <PersonaPicker personas={PERSONAS} onSelect={handlePersonaSelect} />
        </div>
      ) : openItem ? (
        <div key={`item-${openItem.id}`} className="screen-transition-enter">
          <ItemDetail
            item={openItem}
            personaId={personaId}
            onBack={() => setOpenItemId(null)}
            onMoveToCart={() => handleMoveToCart(openItem.id)}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <div style={{ flex: 1 }} className="screen-transition-enter" key={`${screen}-${personaId}`}>
            {screen === "cart" ? (
              <CartView
                items={items}
                personaName={PERSONAS.find((p) => p.id === personaId)?.name ?? ""}
                onOpenItem={setOpenItemId}
              />
            ) : screen === "wishlist" ? (
              <WishlistHome
                items={items}
                activePersonaId={personaId}
                personas={PERSONAS}
                onOpenItem={setOpenItemId}
                onRemoveItems={handleRemoveItems}
              />
            ) : (
              <Alternatives
                persona={PERSONAS.find((p) => p.id === personaId)!}
                items={items}
                onOpenItem={setOpenItemId}
                onToggleWishlist={handleToggleWishlist}
                onMoveToCart={handleAlternativeMoveToCart}
              />
            )}
          </div>
          <TabBar
            active={screen}
            cartCount={items.filter((i) => i.addedToCartAt).length}
            onNavigate={setScreen}
            onSwitchPersona={handleSwitchPersona}
          />
        </div>
      )}
    </div>
  );
}
