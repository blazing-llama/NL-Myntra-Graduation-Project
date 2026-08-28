import { useState } from "react";
import { PERSONAS, WISHLIST_BY_PERSONA } from "../mock-data/personas";
import { PersonaPicker } from "./screens/PersonaPicker";
import { Discovery } from "./screens/Discovery";
import { WishlistHome } from "./screens/WishlistHome";
import { ItemDetail } from "./screens/ItemDetail";
import { CartView } from "./screens/CartView";
import type { BrowseItem, WishlistItem } from "./types";
import { logEvent } from "./lib/logEvent";

// requirement #1: adding to cart never removes the item from the wishlist —
// modelled here as setting addedToCartAt on the same item, never deleting it.

// Phase 3 (docs/PHASE_PLAN.md): Discovery is now the persona's shopping
// home after selection; wishlist/cart are reachable via its header icons,
// not a strictly linear flow.
type Screen = "discovery" | "wishlist" | "cart";

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
  const [screen, setScreen] = useState<Screen>("discovery");

  function handlePersonaSelect(id: string) {
    setPersonaId(id);
    setItems(WISHLIST_BY_PERSONA[id]);
    setOpenItemId(null);
    setScreen("discovery");
  }

  function handleSwitchPersona() {
    setPersonaId(null);
    setOpenItemId(null);
    setScreen("discovery");
  }

  function handleAddToCart(itemId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: new Date().toISOString() } : i)),
    );
    if (personaId) logEvent(itemId, "add_to_cart", personaId);
  }

  // Phase 5: same distinct-from-Add-to-Cart behavior as handleBrowseBuyNow,
  // for an item that's already a real WishlistItem (Back in Stock / Price
  // Drop / Low Quantity section cards) rather than a Browse catalog item.
  function handleWishlistBuyNow(itemId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: new Date().toISOString() } : i)),
    );
    if (personaId) logEvent(itemId, "buy_now", personaId);
    setScreen("cart");
  }

  function handleToggleWishlist(browseItem: BrowseItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === browseItem.id);
      return exists ? prev.filter((i) => i.id !== browseItem.id) : [...prev, toWishlistItem(browseItem)];
    });
  }

  function handleAddBrowseItemToCart(browseItem: BrowseItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === browseItem.id);
      const base = exists ? prev : [...prev, toWishlistItem(browseItem)];
      return base.map((i) => (i.id === browseItem.id ? { ...i, addedToCartAt: new Date().toISOString() } : i));
    });
    if (personaId) logEvent(browseItem.id, "add_to_cart", personaId);
  }

  // Phase 4 (docs/PHASE_PLAN.md): the honest behavioral difference from Add
  // to Cart — this adds the item (if not already present) AND navigates
  // straight to the existing cart page, logged as a distinct buy_now event
  // rather than reusing add_to_cart. Add to Cart, by contrast, stays on the
  // current page with a toast.
  function handleBrowseBuyNow(browseItem: BrowseItem) {
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
            onAddToCart={() => handleAddToCart(openItem.id)}
          />
        </div>
      ) : screen === "cart" ? (
        <div key={`cart-${personaId}`} className="screen-transition-enter">
          <CartView
            items={items}
            personaName={PERSONAS.find((p) => p.id === personaId)?.name ?? ""}
            onBack={() => setScreen("discovery")}
            onOpenItem={setOpenItemId}
          />
        </div>
      ) : screen === "wishlist" ? (
        <div key={`wishlist-${personaId}`} className="screen-transition-enter">
          <WishlistHome
            items={items}
            activePersonaId={personaId}
            personas={PERSONAS}
            onSwitchPersona={handleSwitchPersona}
            onOpenItem={setOpenItemId}
            onRemoveItems={handleRemoveItems}
            onOpenCart={() => setScreen("cart")}
            onBackToDiscovery={() => setScreen("discovery")}
            onAddToCart={handleAddToCart}
            onBuyNow={handleWishlistBuyNow}
          />
        </div>
      ) : (
        <div key={`discovery-${personaId}`} className="screen-transition-enter">
          <Discovery
            persona={PERSONAS.find((p) => p.id === personaId)!}
            items={items}
            onOpenWishlist={() => setScreen("wishlist")}
            onOpenCart={() => setScreen("cart")}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddBrowseItemToCart}
            onBuyNow={handleBrowseBuyNow}
          />
        </div>
      )}
    </div>
  );
}
