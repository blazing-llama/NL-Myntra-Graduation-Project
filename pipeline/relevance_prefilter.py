"""
Phase 1 viability pilot: minimal is_relevant-only pre-filter.

Runs the prompt in agents/relevance_prefilter_prompt.md against every
cleaned review, via local Ollama. This is NOT the frozen Coding Agent —
it exists only to produce the per-app usable-item counts for the
viability gate in wishlist-conversion-blueprint-v2.md Part A.2.

Usage:
    .venv/Scripts/python.exe pipeline/relevance_prefilter.py

Reads data/processed/clean_<app>.json, writes data/processed/relevance_<app>.json.
"""

import json
import re
import sys
import time
from pathlib import Path

import requests

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1:latest"  # see agents/relevance_prefilter_prompt.md for the hermes3:8b substitution note

SYSTEM_PROMPT = """You classify a single app review for a pre-purchase relevance pilot study.

Question: does this text discuss pre-purchase hesitation, wishlist/save
behaviour, or comparison-shopping for a fashion item (uncertainty about
fit, price, occasion fit, quality, availability, or forgetting about a
saved item), or a save/bookmark made for inspiration or styling ideas
rather than near-term purchase intent?

Answer FALSE for: delivery complaints, refund/return-processing-time
complaints, app-crash or login complaints, generic praise or complaints
with no purchase-decision content, complaints about an order already
placed with no earlier hesitation mentioned.

Return ONLY a single JSON object, no other text:
{"is_relevant": boolean, "confidence": number between 0 and 1}"""  # v2 (see prompts/relevance_prefilter_CHANGELOG.md)

JSON_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)

MAX_RETRIES = 2  # retries on top of the first attempt, so 3 tries total
RETRY_BACKOFF_SECONDS = 3  # doubles each retry: 3s, 6s
SKIPPED_ITEMS_PATH = PROCESSED_DIR / "relevance_v2_skipped.jsonl"


def _log_skipped_item(item_id: str | None, content: str, error: str) -> None:
    """A single item exhausted its retries -- record it and move on. Never
    let one bad item take down hours of otherwise-good progress."""
    row = {
        "id": item_id,
        "text_preview": content[:200],
        "error": error,
        "skipped_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    with SKIPPED_ITEMS_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def classify(content: str, item_id: str | None = None, timeout: int = 60) -> dict:
    """Never raises -- always returns a result dict, even on total failure,
    so one slow/unreachable Ollama call can't crash a multi-hour run."""
    prompt = f'{SYSTEM_PROMPT}\n\nReview text: "{content}"'
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
            resp.raise_for_status()
            break
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * (attempt + 1))
                continue
            error_msg = f"gave_up_after_{MAX_RETRIES}_retries: {type(e).__name__}: {e}"
            _log_skipped_item(item_id, content, error_msg)
            return {"is_relevant": None, "confidence": None, "error": error_msg}

    raw = resp.json().get("response", "")
    match = JSON_OBJECT_RE.search(raw)
    if not match:
        return {"is_relevant": None, "confidence": None, "error": "no_json_found", "raw": raw[:200]}
    try:
        parsed = json.loads(match.group(0))
        if "is_relevant" not in parsed:
            return {"is_relevant": None, "confidence": None, "error": "missing_key", "raw": raw[:200]}
        return {"is_relevant": bool(parsed["is_relevant"]), "confidence": parsed.get("confidence")}
    except json.JSONDecodeError as e:
        return {"is_relevant": None, "confidence": None, "error": f"json_parse_failed: {e}", "raw": raw[:200]}


def run_app(name: str) -> dict:
    clean_path = PROCESSED_DIR / f"clean_{name}.json"
    clean = json.loads(clean_path.read_text(encoding="utf-8"))

    results = []
    counts = {"total": 0, "relevant": 0, "not_relevant": 0, "classification_failed": 0}

    for item in clean["items"]:
        counts["total"] += 1
        result = classify(item["text"], item_id=item["id"])
        if result["is_relevant"] is None:
            counts["classification_failed"] += 1
        elif result["is_relevant"]:
            counts["relevant"] += 1
        else:
            counts["not_relevant"] += 1

        results.append(
            {
                "id": item["id"],
                "text": item["text"],
                **result,
            }
        )

    return {"name": name, "counts": counts, "results": results}


def main() -> None:
    only = set(sys.argv[1:]) or None  # optional: run only for these names, e.g. appstore_myntra

    summary_path = PROCESSED_DIR / "relevance_summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8")) if summary_path.exists() else {}

    for clean_file in sorted(PROCESSED_DIR.glob("clean_*.json")):
        if clean_file.name == "clean_summary.json":
            continue
        name = clean_file.stem.replace("clean_", "")
        if only and name not in only:
            continue
        print(f"[{name}] classifying {json.loads(clean_file.read_text(encoding='utf-8'))['counts']['output']} items via {MODEL} ...")
        start = time.time()
        result = run_app(name)
        elapsed = time.time() - start
        summary[name] = result["counts"]
        print(f"[{name}] {result['counts']}  ({elapsed:.0f}s)")

        out_path = PROCESSED_DIR / f"relevance_{name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{name}] written to {out_path}")

    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
