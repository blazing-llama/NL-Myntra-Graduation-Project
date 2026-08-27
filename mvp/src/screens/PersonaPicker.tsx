import { useState } from "react";
import type { Persona } from "../types";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";

// Requirement #10 still applies here: even the landing screen must disclose
// simulated data, not just the wishlist screens.
//
// Round 2 item 1: two-step flow. Step 1 is a small grid of title-only
// cards — tapping one does NOT route anywhere, it opens an info panel
// (step 2) with the persona's real barrier and an honest "where this comes
// from" sourcing line. Only the explicit "View wishlist" action in step 2
// actually navigates.
//
// Accent colors are drawn strictly from the locked palette
// (01_MVP_DESIGN_SPEC.md Section B) — no new colors introduced. Four of the
// six tokens are true accents (Thread Plum / Moss / Ochre / Clay Rose); the
// fifth persona uses Ink-on-Bone instead of inventing a new hue.
const ACCENTS: Record<string, { fg: string; bg: string }> = {
  price_timing_waiter: { fg: "var(--color-ochre)", bg: "var(--color-ochre-bg)" },
  fit_cautious_returner: { fg: "var(--color-thread-plum)", bg: "var(--color-clay-rose-bg)" },
  occasion_driven: { fg: "var(--color-clay-rose)", bg: "var(--color-clay-rose-bg)" },
  quality_evidence_seeker: { fg: "var(--color-moss)", bg: "var(--color-moss-bg)" },
  inspiration_moodboard_saver: { fg: "var(--color-ink)", bg: "var(--color-neutral-bg)" },
};

function accentFor(id: string) {
  return ACCENTS[id] ?? { fg: "var(--color-thread-plum)", bg: "var(--color-neutral-bg)" };
}

interface Props {
  personas: Persona[];
  onSelect: (id: string) => void;
}

export function PersonaPicker({ personas, onSelect }: Props) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const focused = personas.find((p) => p.id === focusedId) ?? null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        padding: "var(--space-xl) 20px var(--space-lg)",
        gap: "var(--space-lg)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <SimulatedDataLabel />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-hero-size)",
            fontWeight: "var(--type-hero-weight)",
            lineHeight: "var(--type-hero-leading)",
            letterSpacing: "var(--type-hero-tracking)",
            margin: 0,
          }}
        >
          {focused ? focused.name : "Whose wishlist do you want to see?"}
        </h1>
        {!focused && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--type-body-size)",
              lineHeight: "var(--type-body-leading)",
              color: "var(--color-ink-secondary)",
            }}
          >
            Five real patterns from the project's own interviews — tap one to learn more.
          </p>
        )}
      </div>

      {focused ? (
        <div className="screen-transition-enter" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <button
            type="button"
            onClick={() => setFocusedId(null)}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: "none",
              color: "var(--color-thread-plum)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              minHeight: "var(--tap-target-min)",
            }}
          >
            ← All personas
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
              padding: "var(--space-lg)",
              borderRadius: "var(--radius-xl)",
              border: `1px solid ${accentFor(focused.id).fg}`,
              background: accentFor(focused.id).bg,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accentFor(focused.id).fg }}>
              The barrier
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--color-ink)" }}>{focused.barrier}</p>

            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accentFor(focused.id).fg, marginTop: 8 }}>
              In their own words
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--color-ink)" }}>{focused.description}</p>

            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${accentFor(focused.id).fg}`,
                fontSize: 12,
                color: "var(--color-ink-secondary)",
              }}
            >
              Where this comes from: {focused.researchNote}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(focused.id)}
            style={{
              minHeight: "var(--tap-target-min)",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-thread-plum)",
              color: "white",
              fontSize: "var(--type-body-size)",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "var(--shadow-tactile-button)",
            }}
          >
            View {focused.name}'s wishlist
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-sm)",
          }}
        >
          {personas.map((persona) => {
            const accent = accentFor(persona.id);
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setFocusedId(persona.id)}
                aria-haspopup="dialog"
                className="persona-card"
                style={{
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-xl)",
                  border: `1px solid ${accent.fg}`,
                  background: accent.bg,
                  cursor: "pointer",
                  minHeight: 88,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 20, color: accent.fg }}>
                  ●
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    lineHeight: 1.25,
                    color: accent.fg,
                  }}
                >
                  {persona.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
