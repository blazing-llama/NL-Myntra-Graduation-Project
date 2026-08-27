import { useState } from "react";
import { PERSONAS, WISHLIST_BY_PERSONA } from "../mock-data/personas";
import { PersonaPicker } from "./screens/PersonaPicker";
import { WishlistHome } from "./screens/WishlistHome";
import { ItemDetail } from "./screens/ItemDetail";
import { CartView } from "./screens/CartView";
import type { WishlistItem } from "./types";
import { logEvent } from "./lib/logEvent";

// requirement #1: adding to cart never removes the item from the wishlist —
// modelled here as setting addedToCartAt on the same item, never deleting it.

export default function App() {
  // null = no persona chosen yet -> PersonaPicker is the first screen on load.
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  function handlePersonaSelect(id: string) {
    setPersonaId(id);
    setItems(WISHLIST_BY_PERSONA[id]);
    setOpenItemId(null);
    setShowCart(false);
  }

  function handleSwitchPersona() {
    setPersonaId(null);
    setOpenItemId(null);
    setShowCart(false);
  }

  function handleAddToCart(itemId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: new Date().toISOString() } : i)),
    );
    if (personaId) logEvent(itemId, "add_to_cart", personaId);
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
      ) : showCart ? (
        <div key={`cart-${personaId}`} className="screen-transition-enter">
          <CartView
            items={items}
            personaName={PERSONAS.find((p) => p.id === personaId)?.name ?? ""}
            onBack={() => setShowCart(false)}
            onOpenItem={setOpenItemId}
          />
        </div>
      ) : (
        <div key={`wishlist-${personaId}`} className="screen-transition-enter">
          <WishlistHome
            items={items}
            activePersonaId={personaId}
            personas={PERSONAS}
            onSwitchPersona={handleSwitchPersona}
            onOpenItem={setOpenItemId}
            onRemoveItems={handleRemoveItems}
            onOpenCart={() => setShowCart(true)}
          />
        </div>
      )}
    </div>
  );
}
