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
saved item)?

Answer FALSE for: delivery complaints, refund/return-processing-time
complaints, app-crash or login complaints, generic praise or complaints
with no purchase-decision content, complaints about an order already
placed with no earlier hesitation mentioned.

Return ONLY a single JSON object, no other text:
{"is_relevant": boolean, "confidence": number between 0 and 1}"""

JSON_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


def classify(content: str, timeout: int = 30) -> dict:
    prompt = f'{SYSTEM_PROMPT}\n\nReview text: "{content}"'
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }
    resp = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
    resp.raise_for_status()
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


def run_app(app_name: str) -> dict:
    clean_path = PROCESSED_DIR / f"clean_{app_name}.json"
    clean = json.loads(clean_path.read_text(encoding="utf-8"))

    results = []
    counts = {"total": 0, "relevant": 0, "not_relevant": 0, "classification_failed": 0}

    for review in clean["reviews"]:
        counts["total"] += 1
        result = classify(review["content"])
        if result["is_relevant"] is None:
            counts["classification_failed"] += 1
        elif result["is_relevant"]:
            counts["relevant"] += 1
        else:
            counts["not_relevant"] += 1

        results.append(
            {
                "evidence_id": review["evidence_id"],
                "content": review["content"],
                **result,
            }
        )

    return {"app_name": app_name, "counts": counts, "results": results}


def main() -> None:
    summary = {}
    for clean_file in sorted(PROCESSED_DIR.glob("clean_*.json")):
        if clean_file.name == "clean_summary.json":
            continue
        app_name = clean_file.stem.replace("clean_", "")
        print(f"[{app_name}] classifying {json.loads(clean_file.read_text(encoding='utf-8'))['counts']['output']} items via {MODEL} ...")
        start = time.time()
        result = run_app(app_name)
        elapsed = time.time() - start
        summary[app_name] = result["counts"]
        print(f"[{app_name}] {result['counts']}  ({elapsed:.0f}s)")

        out_path = PROCESSED_DIR / f"relevance_{app_name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{app_name}] written to {out_path}")

    summary_path = PROCESSED_DIR / "relevance_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
