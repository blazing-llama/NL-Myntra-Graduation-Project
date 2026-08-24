import { useState } from "react";
import type { WishlistItem } from "../types";
import { logEvent } from "../lib/logEvent";

// "Why now" agent UI shell — DRAFT, not final copy (per user request 2026-08-24:
// no spec existed for this feature anywhere in the docs, so this is a proposed
// draft for review/editing, not something to treat as locked).
//
// Deliberately NOT a chatbot: exactly 3 fixed prompts, no free text input, no
// LLM call from this component. "What if I wait?" is wired to the item's real
// stock state — a genuine scarcity fact when one exists, an honest "nothing
// changes" when it doesn't. Never fabricates urgency (v2 blueprint Part 0,
// no-monetary-incentive constraint's spirit extends to no manufactured
// urgency either).

const AGE_THRESHOLD_HOURS = 48; // draft value — confirm with user

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function whatIfIWaitCopy(item: WishlistItem): string {
  switch (item.stock) {
    case "low_stock":
      return "Real fact: this is low in stock in your size right now — waiting risks it selling out before you decide.";
    case "back_in_stock":
      return "Real fact: this just came back in stock after being unavailable — sizes have gone quickly here before.";
    case "out_of_stock":
      return "Real fact: this is currently out of stock in your size — waiting doesn't change that. We'll let you know if it returns.";
    case "in_stock":
      return "Nothing changes if you wait — this item isn't low on stock, and we have no evidence the price is about to move.";
  }
}

interface Props {
  item: WishlistItem;
  personaId: string;
}

export function WhyNowBadge({ item, personaId }: Props) {
  const [open, setOpen] = useState(false);

  const isOldEnough = hoursSince(item.wishlistedAt) >= AGE_THRESHOLD_HOURS;
  const hasEnoughEvidence = item.confidence !== "insufficient";
  if (!isOldEnough || !hasEnoughEvidence) return null;

  function handleToggle() {
    setOpen((o) => {
      const next = !o;
      if (next) logEvent(item.id, "badge_tap", personaId);
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
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: "var(--color-ochre-bg)",
          color: "var(--color-ochre)",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          minHeight: "var(--tap-target-min)",
        }}
      >
        <span aria-hidden="true">◷</span>
        Why now?
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "var(--space-md)",
            background: "var(--color-bone)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Why does this resolve now?</div>
            <div style={{ color: "var(--color-ink-secondary)" }}>{item.narration || item.whatWouldHelp}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>What if I wait?</div>
            <div style={{ color: "var(--color-ink-secondary)" }}>{whatIfIWaitCopy(item)}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Why am I seeing this?</div>
            <div style={{ color: "var(--color-ink-secondary)" }}>{item.trace.summary}</div>
          </div>
        </div>
      )}
    </div>
  );
}
