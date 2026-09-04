"""Compliance checks for the built deck. Run after every real change to
build.js, not just once at the end -- catches the exact class of bug that
slipped through twice already this session (font sizes going under 14pt on
a rushed edit).

Usage: python validate.py "../deck/NL Myntra.pptx" "../deck/NL Myntra.pdf"
"""

import re
import sys
import zipfile
from pathlib import Path

FORBIDDEN_PATTERNS = ["sankalp", "shah", "305zeus", "shah305", "7979", "gmail", "blazing-llama"]
MIN_FONT_PT = 14.0
MAX_SIZE_MB = 40
EXPECTED_SLIDES = 10


def fail(msg):
    print(f"FAIL: {msg}")
    return False


def ok(msg):
    print(f"OK:   {msg}")
    return True


def check_pptx(pptx_path: Path) -> bool:
    passed = True
    z = zipfile.ZipFile(pptx_path)
    slide_files = sorted(
        [n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
        key=lambda n: int(re.search(r"\d+", n).group()),
    )

    # 1. Slide count
    if len(slide_files) == EXPECTED_SLIDES:
        ok(f"slide count = {len(slide_files)}")
    else:
        passed = fail(f"slide count = {len(slide_files)}, expected {EXPECTED_SLIDES}") and False

    # 2. Font size >= 14pt everywhere (sz attribute is in hundredths of a point)
    min_seen = None
    bad_slides = []
    for sf in slide_files:
        xml = z.read(sf).decode("utf-8", errors="replace")
        for m in re.finditer(r'sz="(\d+)"', xml):
            pt = int(m.group(1)) / 100
            if min_seen is None or pt < min_seen:
                min_seen = pt
            if pt < MIN_FONT_PT:
                bad_slides.append((sf, pt))
    if bad_slides:
        passed = False
        for sf, pt in bad_slides:
            fail(f"font size {pt}pt < {MIN_FONT_PT}pt in {sf}")
    else:
        ok(f"minimum font size across all slides = {min_seen}pt (>= {MIN_FONT_PT}pt)")

    # 3. Name/email grep across every slide + notes + core.xml
    all_text = ""
    for n in z.namelist():
        if n.endswith(".xml") or n.endswith(".rels"):
            all_text += z.read(n).decode("utf-8", errors="replace")
    hits = []
    for pat in FORBIDDEN_PATTERNS:
        if pat == "blazing-llama":
            continue  # the git author identity, not a personal name -- expected absent anyway, checked separately below
        found = list(re.finditer(pat, all_text, re.IGNORECASE))
        if found:
            hits.append((pat, len(found)))
    if hits:
        passed = False
        for pat, n in hits:
            fail(f'name/email pattern "{pat}" found {n} time(s) in pptx XML')
    else:
        ok("zero name/email pattern hits across all pptx XML")

    # 4. Hyperlinks: confirm real embedded relationships, not just underlined text
    expected_urls = [
        "https://zeusworkspace1.app.n8n.cloud/webhook/wishlist-discovery-engine",
        "https://mvp-henna-delta.vercel.app",
        "https://docs.google.com/forms/d/e/1FAIpQLScsU5OcvTbEetugF0pG-ek2eo_8VEz1DLEjX0gMDsydgOHizA/viewform",
        "https://github.com/blazing-llama/NL-Myntra-Graduation-Project",
    ]
    rels_text = ""
    for n in z.namelist():
        if n.startswith("ppt/slides/_rels/") and n.endswith(".rels"):
            rels_text += z.read(n).decode("utf-8", errors="replace")
    for url in expected_urls:
        if f'Target="{url}"' in rels_text:
            ok(f"embedded hyperlink present: {url}")
        else:
            passed = fail(f"NO embedded hyperlink relationship for: {url}") and False

    # 5. File size
    size_mb = pptx_path.stat().st_size / (1024 * 1024)
    if size_mb < MAX_SIZE_MB:
        ok(f"pptx file size = {size_mb:.2f}MB (< {MAX_SIZE_MB}MB)")
    else:
        passed = fail(f"pptx file size = {size_mb:.2f}MB (>= {MAX_SIZE_MB}MB)") and False

    return passed


def check_pdf(pdf_path: Path) -> bool:
    if not pdf_path.exists():
        return fail(f"{pdf_path} does not exist")
    passed = True
    size_mb = pdf_path.stat().st_size / (1024 * 1024)
    if size_mb < MAX_SIZE_MB:
        ok(f"pdf file size = {size_mb:.2f}MB (< {MAX_SIZE_MB}MB)")
    else:
        passed = fail(f"pdf file size = {size_mb:.2f}MB (>= {MAX_SIZE_MB}MB)") and False
    return passed


if __name__ == "__main__":
    pptx_path = Path(sys.argv[1] if len(sys.argv) > 1 else "../deck/NL Myntra.pptx")
    pdf_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None

    print(f"--- Validating {pptx_path} ---")
    pptx_ok = check_pptx(pptx_path)

    pdf_ok = True
    if pdf_path:
        print(f"\n--- Validating {pdf_path} ---")
        pdf_ok = check_pdf(pdf_path)

    print("\n=== RESULT:", "PASS" if (pptx_ok and pdf_ok) else "FAIL", "===")
    sys.exit(0 if (pptx_ok and pdf_ok) else 1)
