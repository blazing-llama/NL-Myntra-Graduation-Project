import { useEffect, useState } from "react";
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

// Audit fix (round 3, item 9, scoped down from the report's "add real
// routing" suggestion): real client-side routing is out of scope this
// round. This is the narrower fix — remember the last-active persona +
// screen in sessionStorage so an accidental reload lands back where the
// demo was, not all the way at the picker. Deliberately does not persist
// cart/wishlist edits (that would need the routing-level rework); a
// restored session re-derives `items` from the persona's base mock data.
const SESSION_KEY = "wishlist-mvp-session";

function readSavedSession(): { personaId: string; screen: Screen } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { personaId?: unknown; screen?: unknown };
    if (
      typeof parsed.personaId === "string" &&
      typeof parsed.screen === "string" &&
      PERSONAS.some((p) => p.id === parsed.personaId)
    ) {
      return { personaId: parsed.personaId, screen: parsed.screen as Screen };
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.) or a corrupted value —
    // fall through to the normal picker-first load, same as before this fix.
  }
  return null;
}

export default function App() {
  // null = no persona chosen yet -> PersonaPicker is the first screen on load,
  // unless a prior session in this tab already picked one (see above).
  const [saved] = useState(readSavedSession);
  const [personaId, setPersonaId] = useState<string | null>(saved?.personaId ?? null);
  const [items, setItems] = useState<WishlistItem[]>(saved ? WISHLIST_BY_PERSONA[saved.personaId] : []);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(saved?.screen ?? "wishlist");

  useEffect(() => {
    try {
      if (personaId) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ personaId, screen }));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore — same fallback as readSavedSession above
    }
  }, [personaId, screen]);

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

  // Audit fix (round 3, item 5): un-carting an item mirrors requirement #1's
  // own logic in reverse — it clears addedToCartAt, it never deletes the
  // item, so it stays in the wishlist exactly like a cart-add never removes
  // it from there.
  function handleRemoveFromCart(itemId: string) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: null } : i)));
  }

  const openItem = items.find((i) => i.id === openItemId) ?? null;

  return (
    <div className="app-shell">
      <p className="app-frame-caption">Designed mobile-first — this is exactly what a shopper sees on their phone.</p>
      <div className="app-frame">
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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "var(--frame-inner-min-height)" }}>
          <div style={{ flex: 1 }} className="screen-transition-enter" key={`${screen}-${personaId}`}>
            {screen === "cart" ? (
              <CartView
                items={items}
                personaName={PERSONAS.find((p) => p.id === personaId)?.name ?? ""}
                onOpenItem={setOpenItemId}
                onRemoveFromCart={handleRemoveFromCart}
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
    </div>
  );
}
