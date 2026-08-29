import { useState } from "react";
import type { Persona } from "../types";
import { SimulatedDataLabel } from "../components/SimulatedDataLabel";

// Requirement #10 still applies here: even the landing screen must disclose
// simulated data, not just the wishlist screens.
//
// Round 2 item 1 (superseded by Phase 2 of docs/PHASE_PLAN.md): the two-step
// flow (tap -> separate info-panel screen -> Select) is now a single-step
// inline accordion. Tapping a card expands it IN PLACE within the grid
// (pushing later cards down a row via CSS grid reflow, no navigation away)
// showing the same real content this always had — barrier, quote, sourcing
// line — with "Select" now living inside the expanded card itself. Only one
// card is expanded at a time; tapping the expanded card again collapses it.
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

// Phase C (docs/PHASE_PLAN_2.md): a small human-readable marker per blocker
// type, shown on the compact card. Not a new taxonomy — just a one-word
// label for the same `barrier` field already on each persona.
const BLOCKER_TYPE: Record<string, string> = {
  price_timing_waiter: "Price",
  fit_cautious_returner: "Fit",
  occasion_driven: "Timing",
  quality_evidence_seeker: "Trust",
  inspiration_moodboard_saver: "Intent",
};

// Every persona's `description` opens with a real interview quote in curly
// quotes — pull just that for the compact card rather than the full sentence.
function extractQuote(description: string): string | null {
  const match = description.match(/^“([^”]+)”/);
  return match ? match[1] : null;
}

interface Props {
  personas: Persona[];
  onSelect: (id: string) => void;
}

export function PersonaPicker({ personas, onSelect }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

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
          Whose wishlist do you want to see?
        </h1>
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-sm)",
          alignItems: "start",
        }}
      >
        {personas.map((persona, index) => {
          const accent = accentFor(persona.id);
          const isExpanded = expandedId === persona.id;

          if (isExpanded) {
            return (
              <div
                key={persona.id}
                className="trace-card-enter"
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                  padding: "var(--space-lg)",
                  borderRadius: "var(--radius-card)",
                  background: accent.bg,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(persona.id)}
                  aria-expanded="true"
                  style={{
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: "var(--tap-target-min)",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 20, color: accent.fg }}>
                    ●
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--type-card-title-size)",
                      lineHeight: 1.25,
                      color: accent.fg,
                    }}
                  >
                    {persona.name}
                  </span>
                </button>

                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent.fg }}>
                  The barrier
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--color-ink)" }}>{persona.barrier}</p>

                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent.fg, marginTop: 8 }}>
                  In their own words
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--color-ink)" }}>{persona.description}</p>

                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${accent.fg}`,
                    fontSize: 12,
                    color: "var(--color-ink-secondary)",
                  }}
                >
                  Where this comes from: {persona.researchNote}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(persona.id)}
                  style={{
                    marginTop: 8,
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
                  View {persona.name}'s wishlist
                </button>
              </div>
            );
          }

          const isFlagship = index === 0;
          const quote = extractQuote(persona.description);

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => toggle(persona.id)}
              aria-expanded="false"
              className="persona-card"
              style={{
                gridColumn: isFlagship ? "1 / -1" : undefined,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "var(--space-md)",
                borderRadius: "var(--radius-card)",
                background: accent.bg,
                cursor: "pointer",
                minHeight: isFlagship ? 120 : 100,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: accent.fg,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.5)",
                  }}
                >
                  {BLOCKER_TYPE[persona.id] ?? "Blocker"}
                </span>
                {isFlagship && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: accent.fg, letterSpacing: "0.04em" }}>
                    FLAGSHIP DEMO
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isFlagship ? 18 : 15,
                  lineHeight: 1.25,
                  color: accent.fg,
                }}
              >
                {persona.name}
              </span>
              <span style={{ fontSize: 12, lineHeight: 1.4, color: "var(--color-ink)" }}>{persona.barrier}</span>
              {quote && (
                <span style={{ fontSize: 12, lineHeight: 1.4, color: "var(--color-ink-secondary)", fontStyle: "italic" }}>
                  “{quote}”
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
