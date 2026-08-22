// Requirement #10: simulated data is labelled in the UI itself, not just the deck.

export function SimulatedDataLabel() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "var(--color-ink)",
        opacity: 0.6,
        fontFamily: "var(--font-body)",
      }}
    >
      <span aria-hidden="true">◆</span>
      Simulated data — derived from primary research
    </div>
  );
}
