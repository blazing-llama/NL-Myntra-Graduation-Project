"""Render every page of a PDF to a PNG for visual inspection -- the
mandatory "generate an image of every slide" check. Self-contained via
PyMuPDF; doesn't need poppler/pdftoppm on PATH.

Usage: python render_slides.py "NL Myntra.pdf" out_dir/
"""

import sys
from pathlib import Path

import pymupdf

pdf_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

doc = pymupdf.open(pdf_path)
print(f"{len(doc)} pages")
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(dpi=150)
    out_path = out_dir / f"slide-{i:02d}.png"
    pix.save(out_path)
    print(f"saved {out_path}")
