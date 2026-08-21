"""
Clean raw scraped/collected items: dedupe, language filter, PII scrub,
length filter. Source-agnostic — operates on the unified schema
(docs/decisions/unified-data-schema.md), so it works the same way for
Play Store JSON and hand-curated Reddit JSONL.

Frozen chain per v2 Part D.1: raw/ -> clean/ -> coded/ -> analysis/ -> deck/.
No manual edits to outputs, ever — if a number looks wrong, fix this script
and re-run.

Usage:
    .venv/Scripts/python.exe pipeline/clean.py

Reads every data/raw/*.json (one object with an "items"/"reviews" list)
and data/raw/*.jsonl (one unified-schema record per line), writes
data/processed/clean_<name>.json per input file, keyed by source.
"""

import hashlib
import json
import re
from pathlib import Path

from langdetect import DetectorFactory, LangDetectException, detect

DetectorFactory.seed = 0  # deterministic langdetect output

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

MIN_LENGTH_CHARS = 15  # below this, text is rarely more than "good app" boilerplate
ALLOWED_LANGS = {"en"}  # Hinglish written in Latin script is detected as 'en' by langdetect

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?<!\d)(?:\+?91[-\s]?)?[6-9]\d{9}(?!\d)")
URL_RE = re.compile(r"https?://\S+|www\.\S+")


def scrub_pii(text: str) -> tuple[str, bool]:
    scrubbed = EMAIL_RE.sub("[EMAIL]", text)
    scrubbed = PHONE_RE.sub("[PHONE]", scrubbed)
    scrubbed = URL_RE.sub("[URL]", scrubbed)
    return scrubbed, scrubbed != text


def normalize_for_dedupe(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def detect_lang(text: str) -> str | None:
    try:
        return detect(text)
    except LangDetectException:
        return None


def ensure_id(item: dict) -> str:
    """Stable per-item id. Hand-curated rows (e.g. Reddit) may arrive
    without one — derive a deterministic id from the url so re-running
    this script never reassigns ids."""
    if item.get("id"):
        return item["id"]
    source = item.get("source", "unknown")
    basis = item.get("url") or item.get("text", "")
    digest = hashlib.sha1(basis.encode("utf-8")).hexdigest()[:12]
    return f"{source}-{digest}"


def load_items(raw_path: Path) -> list[dict]:
    if raw_path.suffix == ".jsonl":
        items = []
        for line in raw_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                items.append(json.loads(line))
        return items

    payload = json.loads(raw_path.read_text(encoding="utf-8"))
    return payload.get("reviews") or payload.get("items") or []


def clean_file(raw_path: Path) -> dict:
    items = load_items(raw_path)

    counts = {
        "input": len(items),
        "dropped_empty": 0,
        "dropped_too_short": 0,
        "dropped_non_english": 0,
        "dropped_duplicate": 0,
        "pii_scrubbed": 0,
        "output": 0,
    }

    seen_normalized: set[str] = set()
    cleaned: list[dict] = []

    for item in items:
        text = (item.get("text") or "").strip()

        if not text:
            counts["dropped_empty"] += 1
            continue

        if len(text) < MIN_LENGTH_CHARS:
            counts["dropped_too_short"] += 1
            continue

        norm = normalize_for_dedupe(text)
        if norm in seen_normalized:
            counts["dropped_duplicate"] += 1
            continue

        lang = detect_lang(text)
        if lang not in ALLOWED_LANGS:
            counts["dropped_non_english"] += 1
            continue

        scrubbed_text, was_scrubbed = scrub_pii(text)
        if was_scrubbed:
            counts["pii_scrubbed"] += 1

        seen_normalized.add(norm)
        cleaned.append(
            {
                "id": ensure_id(item),
                "source": item.get("source"),
                "text": scrubbed_text,
                "rating": item.get("rating"),
                "date": item.get("date"),
                "url": item.get("url"),
                "lang": lang,
                "meta": item.get("meta", {}),
            }
        )
        counts["output"] += 1

    return {
        "raw_file": raw_path.name,
        "counts": counts,
        "items": cleaned,
    }


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    summary = {}

    raw_files = sorted(RAW_DIR.glob("*.json")) + sorted(RAW_DIR.glob("*.jsonl"))
    for raw_file in raw_files:
        name = raw_file.stem.replace("playstore_", "").replace("_manual", "")
        print(f"[{name}] cleaning {raw_file.name} ...")
        result = clean_file(raw_file)
        summary[name] = result["counts"]

        out_path = PROCESSED_DIR / f"clean_{name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{name}] {result['counts']}")
        print(f"[{name}] written to {out_path}")

    summary_path = PROCESSED_DIR / "clean_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
