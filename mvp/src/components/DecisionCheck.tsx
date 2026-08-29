import { useState } from "react";
import type { WishlistItem } from "../types";
import { logEvent } from "../lib/logEvent";

// Presentation upgrade over the old split WhyNowBadge / WhyAmISeeingThis
// pair (consolidated here — that split had drifted into showing the same
// trace text twice, flagged during Phase 3). HARD CONSTRAINT, unchanged:
// still exactly 3 fixed prompts, no free-text input, no LLM call from this
// component — this is a presentation layer over already-computed
// deterministic-core fields (item.narration / item.trace / stock state),
// not a chatbot. Requirement #8 (a visible trace must always be present)
// means this widget itself is never hidden — individual prompts show an
// honest "not enough signal" fallback instead of disappearing when the
// underlying evidence is thin, matching requirement #7's philosophy that
// insufficient evidence is a stated feature, not a failure to paper over.

const AGE_THRESHOLD_HOURS = 48;

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function whatIfIWaitCopy(item: WishlistItem): string {
  switch (item.stock) {
    case "low_stock":
      return "This is low in stock in your size right now — waiting risks it selling out before you decide.";
    case "back_in_stock":
      return "This just came back in stock after being unavailable — sizes have gone quickly here before.";
    case "out_of_stock":
      return "This is currently out of stock in your size — waiting doesn't change that. We'll let you know if it returns.";
    case "in_stock":
      return "Nothing changes if you wait — this item isn't low on stock, and we have no evidence the price is about to move.";
  }
}

function daysSince(iso: string): number {
  return Math.max(1, Math.round(hoursSince(iso) / 24));
}

// Round 2 item 8: when the item has a genuine restock event on file, that's
// real usable evidence for "why resolves now" — broadens what counts as
// signal without touching the 3-state confidence enum itself. Only applies
// when the mock data actually has a restock timestamp; never fabricated.
function resolvesNowCopy(item: WishlistItem): string {
  const hasEnoughSignal = item.confidence !== "insufficient";
  if (hasEnoughSignal) return item.narration || "No specific signal on file yet for this item.";
  if (item.restockedAt) {
    return `This came back in stock ${daysSince(item.restockedAt)} day${daysSince(item.restockedAt) === 1 ? "" : "s"} ago after being unavailable — a real signal, even though we still don't have enough history for a confident comparison.`;
  }
  return item.whatWouldHelp ?? "Not enough purchase history yet to say why this resolves now.";
}

// Round 2 item 9: one-line synthesis at the top of the widget, templated
// from existing fields only — not a new free-form generation.
function summaryLine(item: WishlistItem): string {
  if (item.restockedAt) {
    return `Back in stock — you saved this ${daysSince(item.wishlistedAt)} day${daysSince(item.wishlistedAt) === 1 ? "" : "s"} ago.`;
  }
  if (item.stock === "low_stock") return "Running low in your size right now.";
  if (item.stock === "out_of_stock") return "Currently out of stock in your size.";
  if (item.confidence === "high") return "Enough evidence to make a confident call.";
  if (item.confidence === "medium") return "Partial signal — worth a second look before deciding.";
  return "Not enough history yet to compare this one confidently.";
}

// Phase E (docs/PHASE_PLAN_2.md): renamed from AI Trace to Decision Check,
// tabs renamed to plain language. Same hard constraint as before: exactly
// 3 fixed prompts, no free-text input, no LLM call — a presentation layer
// over already-computed fields, not a chatbot.
type PromptId = "resolves_now" | "what_if_wait" | "seeing_this";

const PROMPTS: Array<{ id: PromptId; label: string }> = [
  { id: "resolves_now", label: "Why now" },
  { id: "what_if_wait", label: "If you wait" },
  { id: "seeing_this", label: "Evidence" },
];

interface Props {
  item: WishlistItem;
  personaId: string;
}

export function DecisionCheck({ item, personaId }: Props) {
  const [open, setOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<PromptId>("resolves_now");
  const [animKey, setAnimKey] = useState(0);

  const isOldEnough = hoursSince(item.wishlistedAt) >= AGE_THRESHOLD_HOURS;

  function handleOpenToggle() {
    setOpen((o) => {
      const next = !o;
      if (next) logEvent(item.id, "badge_tap", personaId);
      return next;
    });
  }

  function handlePromptChange(id: PromptId) {
    setActivePrompt(id);
    setAnimKey((k) => k + 1);
    if (id === "seeing_this") logEvent(item.id, "trace_expand", personaId);
  }

  function answerFor(id: PromptId): string {
    if (id === "resolves_now") {
      return resolvesNowCopy(item);
    }
    if (id === "what_if_wait") {
      if (!isOldEnough) return "This was saved recently — too soon to have a meaningful waiting signal either way.";
      return whatIfIWaitCopy(item);
    }
    // seeing_this
    return item.trace.summary;
  }

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <button
        type="button"
        onClick={handleOpenToggle}
        aria-expanded={open}
        className="trace-widget-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          background: "var(--color-thread-plum-dark)",
          color: "white",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          minHeight: "var(--tap-target-min)",
        }}
      >
        <span aria-hidden="true" className="trace-widget-icon">
          ◈
        </span>
        Decision Check
      </button>

      {open && (
        <div
          className="trace-card-enter"
          style={{
            marginTop: 8,
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bone)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px var(--space-md) 8px",
              borderBottom: "1px solid var(--color-border)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span aria-hidden="true" className="trace-widget-icon" style={{ fontSize: 14 }}>
              ◈
            </span>
            {summaryLine(item)}
          </div>

          <div style={{ display: "flex", gap: 6, padding: "10px 10px 0", overflowX: "auto" }}>
            {PROMPTS.map((p) => {
              const active = p.id === activePrompt;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePromptChange(p.id)}
                  aria-pressed={active}
                  style={{
                    flexShrink: 0,
                    minHeight: "var(--tap-target-min)",
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${active ? "var(--color-thread-plum)" : "var(--color-border)"}`,
                    background: active ? "var(--color-thread-plum)" : "transparent",
                    color: active ? "white" : "var(--color-ink)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div key={animKey} className="trace-answer-enter" style={{ padding: "var(--space-md)" }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{answerFor(activePrompt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
