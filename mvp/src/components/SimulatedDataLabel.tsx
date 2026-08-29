// Requirement #10: simulated data is labelled in the UI itself, not just the deck.

// Audit fix (round 3, item 1): this label was always styled for the light
// Bone background, so when reused inside a dark Thread-Plum banner (see
// WishlistHome's persona summary card) it rendered near-black text at 60%
// opacity on a dark maroon fill — effectively illegible. `inverted` opts
// into the same white-inherits-from-parent treatment already used for the
// persona description text right below it in that same banner, instead of
// forcing a color that only works on light backgrounds.
export function SimulatedDataLabel({ inverted = false }: { inverted?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: inverted ? "white" : "var(--color-ink)",
        opacity: inverted ? 0.75 : 0.6,
        fontFamily: "var(--font-body)",
      }}
    >
      <span aria-hidden="true">◆</span>
      Simulated data — derived from primary research
    </div>
  );
}
