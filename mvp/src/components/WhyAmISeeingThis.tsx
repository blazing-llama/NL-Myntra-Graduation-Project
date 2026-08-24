import { useState } from "react";
import type { ResearchTrace } from "../types";
import { logEvent } from "../lib/logEvent";

// Requirement #8: every recommendation has a visible "why am I seeing this"
// trace to a research finding. findingId is a placeholder until Phase 5
// selects the barrier and the real finding IDs from the discovery engine exist.

interface Props {
  trace: ResearchTrace;
  itemId: string;
  personaId: string;
}

export function WhyAmISeeingThis({ trace, itemId, personaId }: Props) {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    setOpen((o) => {
      const next = !o;
      if (next) logEvent(itemId, "trace_expand", personaId); // log on open, not on close
      return next;
    });
  }

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "var(--color-thread-plum)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          minHeight: "var(--tap-target-min)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span aria-hidden="true" style={{ transform: open ? "rotate(90deg)" : "none", display: "inline-block", transition: "var(--transition-fast)" }}>
          ›
        </span>
        Why am I seeing this?
      </button>
      {open && (
        <div
          style={{
            marginTop: 6,
            padding: "10px 12px",
            background: "var(--color-bone)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-ink-secondary)",
              marginBottom: 4,
            }}
          >
            {trace.findingId}
          </div>
          {trace.summary}
        </div>
      )}
    </div>
  );
}
