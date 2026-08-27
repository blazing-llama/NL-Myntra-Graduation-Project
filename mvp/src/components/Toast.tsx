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
