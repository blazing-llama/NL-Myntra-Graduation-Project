import { useState } from "react";
import { PERSONAS, WISHLIST_BY_PERSONA } from "../mock-data/personas";
import { WishlistHome } from "./screens/WishlistHome";
import { ItemDetail } from "./screens/ItemDetail";
import type { WishlistItem } from "./types";
import { logEvent } from "./lib/logEvent";

// requirement #1: adding to cart never removes the item from the wishlist —
// modelled here as setting addedToCartAt on the same item, never deleting it.

export default function App() {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [items, setItems] = useState<WishlistItem[]>(WISHLIST_BY_PERSONA[PERSONAS[0].id]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  function handlePersonaChange(id: string) {
    setPersonaId(id);
    setItems(WISHLIST_BY_PERSONA[id]);
    setOpenItemId(null);
  }

  function handleAddToCart(itemId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, addedToCartAt: new Date().toISOString() } : i)),
    );
    logEvent(itemId, "add_to_cart", personaId);
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
      {openItem ? (
        <ItemDetail
          item={openItem}
          personaId={personaId}
          onBack={() => setOpenItemId(null)}
          onAddToCart={() => handleAddToCart(openItem.id)}
        />
      ) : (
        <WishlistHome
          items={items}
          personas={PERSONAS}
          activePersonaId={personaId}
          onPersonaChange={handlePersonaChange}
          onOpenItem={setOpenItemId}
        />
      )}
    </div>
  );
}
