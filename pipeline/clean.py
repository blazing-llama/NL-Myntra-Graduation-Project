"""
Clean raw scraped reviews: dedupe, language filter, PII scrub, length filter.

Frozen chain per v2 Part D.1: raw/ -> clean/ -> coded/ -> analysis/ -> deck/.
No manual edits to outputs, ever — if a number looks wrong, fix this script
and re-run.

Usage:
    .venv/Scripts/python.exe pipeline/clean.py

Reads data/raw/playstore_<app>.json, writes data/processed/clean_<app>.json.
"""

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


def clean_app(app_name: str) -> dict:
    raw_path = RAW_DIR / f"playstore_{app_name}.json"
    raw = json.loads(raw_path.read_text(encoding="utf-8"))

    counts = {
        "input": len(raw["reviews"]),
        "dropped_empty": 0,
        "dropped_too_short": 0,
        "dropped_non_english": 0,
        "dropped_duplicate": 0,
        "pii_scrubbed": 0,
        "output": 0,
    }

    seen_normalized: set[str] = set()
    cleaned: list[dict] = []

    for r in raw["reviews"]:
        content = (r.get("content") or "").strip()

        if not content:
            counts["dropped_empty"] += 1
            continue

        if len(content) < MIN_LENGTH_CHARS:
            counts["dropped_too_short"] += 1
            continue

        norm = normalize_for_dedupe(content)
        if norm in seen_normalized:
            counts["dropped_duplicate"] += 1
            continue

        lang = detect_lang(content)
        if lang not in ALLOWED_LANGS:
            counts["dropped_non_english"] += 1
            continue

        scrubbed_content, was_scrubbed = scrub_pii(content)
        if was_scrubbed:
            counts["pii_scrubbed"] += 1

        seen_normalized.add(norm)
        cleaned.append(
            {
                "evidence_id": f"{app_name}-{r.get('review_id')}",
                "app_name": app_name,
                "content": scrubbed_content,
                "score": r.get("score"),
                "at": r.get("at"),
                "detected_lang": lang,
            }
        )
        counts["output"] += 1

    return {
        "app_name": app_name,
        "source": "playstore",
        "counts": counts,
        "reviews": cleaned,
    }


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    summary = {}

    for raw_file in sorted(RAW_DIR.glob("playstore_*.json")):
        app_name = raw_file.stem.replace("playstore_", "")
        print(f"[{app_name}] cleaning ...")
        result = clean_app(app_name)
        summary[app_name] = result["counts"]

        out_path = PROCESSED_DIR / f"clean_{app_name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{app_name}] {result['counts']}")
        print(f"[{app_name}] written to {out_path}")

    summary_path = PROCESSED_DIR / "clean_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
