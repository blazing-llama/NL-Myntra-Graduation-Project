// Phase A (docs/PHASE_PLAN_2.md): Wishlist is now the primary experience,
// reachable alongside Alternatives/Cart/Switch persona from one persistent
// bottom bar rather than screen-specific back arrows — makes the active
// section obvious on mobile at a glance. Not shown on the Item Decision
// Page, which has its own sticky bottom CTA (Phase E) and would conflict.

export type TabScreen = "wishlist" | "alternatives" | "cart";

interface Props {
  active: TabScreen;
  cartCount: number;
  onNavigate: (screen: TabScreen) => void;
  onSwitchPersona: () => void;
}

const TABS: Array<{ id: TabScreen; label: string; icon: string }> = [
  { id: "wishlist", label: "Wishlist", icon: "♡" },
  { id: "alternatives", label: "Alternatives", icon: "≈" },
  { id: "cart", label: "Cart", icon: "🛍" },
];

export function TabBar({ active, cartCount, onNavigate, onSwitchPersona }: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        alignItems: "stretch",
        background: "var(--color-bone)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "10px 4px 8px",
              minHeight: "var(--tap-target-min)",
              border: "none",
              borderTop: isActive ? "2px solid var(--color-thread-plum)" : "2px solid transparent",
              background: "transparent",
              color: isActive ? "var(--color-thread-plum)" : "var(--color-ink-secondary)",
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
            {tab.id === "cart" && cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: "calc(50% - 20px)",
                  minWidth: 16,
                  height: 16,
                  borderRadius: 999,
                  background: "var(--color-thread-plum)",
                  color: "white",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onSwitchPersona}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: "10px 4px 8px",
          minHeight: "var(--tap-target-min)",
          border: "none",
          borderTop: "2px solid transparent",
          background: "transparent",
          color: "var(--color-ink-secondary)",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>
          ⇄
        </span>
        <span style={{ fontSize: 11 }}>Switch</span>
      </button>
    </div>
  );
}
