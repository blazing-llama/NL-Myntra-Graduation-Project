import type { ReactNode } from "react";

// Sticky top nav — treatment borrowed from fashion-ecommerce-design-spec.md
// Theme A: sticky top-0, translucent + backdrop-blur background, bottom
// border, generous horizontal padding. Locked palette/typefaces, not
// Theme A's own colors.

interface Props {
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode; // Phase 3: header icons (heart/cart) on the Discovery page
}

export function TopNav({ children, leading, trailing }: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        background: "rgba(246, 241, 234, 0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {leading}
      <div
        style={{
          flex: 1,
          fontFamily: "var(--font-display)",
          fontSize: "var(--type-section-title-size)",
          fontWeight: "var(--type-section-title-weight)",
          lineHeight: "var(--type-section-title-leading)",
          letterSpacing: "var(--type-section-title-tracking)",
        }}
      >
        {children}
      </div>
      {trailing}
    </div>
  );
}
