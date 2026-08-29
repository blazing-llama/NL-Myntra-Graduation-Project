import { useState, type CSSProperties } from "react";

// Audit fix (round 3, item 4): a failed image load used to fall through to
// the bare browser broken-image glyph plus the raw alt text overflowing the
// card — no branded fallback. This swaps in a plain placeholder using the
// same monochrome-glyph language as the rest of the app (◆ ◈ ● ▲ ▼ ✓ ✕),
// not a stock photo icon or emoji. Same footprint as the image it replaces,
// so it never shifts layout.

interface Props {
  src: string;
  alt: string;
  style?: CSSProperties;
}

export function ProductImage({ src, alt, style }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-neutral-bg)",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 22, color: "var(--color-ink-secondary)" }}>
          ⬚
        </span>
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />;
}
