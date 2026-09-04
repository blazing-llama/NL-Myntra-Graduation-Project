# Deck build

Source of truth for `docs/deck/NL Myntra.pptx` + `NL Myntra.pdf`. Previously this only ever existed in a temporary/scratch location between sessions — moved into the repo for real this round so it doesn't happen again.

## Rebuild the deck

```bash
cd docs/deck-build
npm install                 # once
node build.js                              # -> NL Myntra draft.pptx (local, doesn't touch docs/deck/)
python validate.py "NL Myntra draft.pptx"   # compliance checks -- must PASS
node convert_to_pdf.js "NL Myntra draft.pptx" .     # -> NL Myntra draft.pdf, via LibreOffice headless
python render_slides.py "NL Myntra draft.pdf" render/   # -> render/slide-01.png ... slide-10.png, for visual inspection
```

Only once the draft passes `validate.py` **and** every rendered slide has been looked at for overflow/collision, promote it:

```bash
cp "NL Myntra draft.pptx" "../deck/NL Myntra.pptx"
cp "NL Myntra draft.pdf" "../deck/NL Myntra.pdf"
```

## What `validate.py` checks

1. Exactly 10 slides
2. Every font size ≥ 14pt (parses `sz=` attributes directly from the slide XML)
3. Zero hits for personal name/email patterns across all slide XML
4. The 4 expected URLs (n8n webhook, MVP, survey, repo) exist as real embedded hyperlink relationships in `ppt/slides/_rels/*.rels` — not just underlined text
5. File size well under the 40MB submission limit

## Dependencies

- `pptxgenjs` (npm, installed via `package.json` in this folder)
- LibreOffice, for pptx→pdf only (`node convert_to_pdf.js`) — the one non-Node dependency in this chain, since there's no reliable pptx→pdf conversion without a real Office/LibreOffice engine
- `pymupdf` (pip) for pdf→PNG page rendering (`render_slides.py`) — self-contained, doesn't need poppler/pdftoppm on PATH
