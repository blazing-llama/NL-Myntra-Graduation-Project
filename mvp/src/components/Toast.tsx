import { useEffect } from "react";

// Real add-to-cart feedback (was previously silent). Auto-dismisses;
// never blocks interaction underneath it.

interface Props {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-enter"
      style={{
        // Tried position:"absolute" here to contain this within the
        // phone-frame mockup at wide widths (round 3, item 8) — reverted:
        // .app-frame has no fixed height/overflow at mobile widths, so an
        // absolutely-positioned inset:0 descendant spans the whole
        // scrollable page there, not just the visible viewport, and this
        // toast ended up anchored near the bottom of the full page instead
        // of the bottom of the screen. Fixed is correct at every width;
        // covering the full browser window instead of just the phone-frame
        // at ≥700px is the accepted tradeoff, not a functional break.
        position: "fixed",
        left: "50%",
        bottom: "calc(88px + env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        background: "var(--color-ink)",
        color: "white",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 16px rgba(33, 29, 27, 0.25)",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ color: "var(--color-moss)" }}>
        ✓
      </span>
      {message}
    </div>
  );
}
