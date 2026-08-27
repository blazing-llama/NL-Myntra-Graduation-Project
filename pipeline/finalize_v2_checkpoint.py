"""
Finalize the v2 relevance checkpoint AS-IS, without resuming classification.

The 2026-08-25 run was intentionally stopped at 2,203/2,921 items (75%) --
not a crash -- per explicit user instruction. This script rebuilds
data/processed/relevance_<name>.json and relevance_summary.json from
exactly what's in the checkpoint right now, so downstream consumers
(gold-set sampling, research-findings.md) see a coherent final v2 result
instead of the stale pre-v2 summary.

Usage:
    .venv/Scripts/python.exe pipeline/finalize_v2_checkpoint.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = ROOT / "data" / "processed"
CHECKPOINT_PATH = PROCESSED_DIR / "relevance_v2_checkpoint.jsonl"


def main() -> None:
    done: dict[str, dict] = {}
    with CHECKPOINT_PATH.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                row = json.loads(line)
                done[row["id"]] = row

    by_source: dict[str, list[dict]] = {}
    for row in done.values():
        by_source.setdefault(row["source_name"], []).append(row)

    summary = {}
    for name, rows in by_source.items():
        counts = {"total": 0, "relevant": 0, "not_relevant": 0, "classification_failed": 0}
        results = []
        for r in rows:
            counts["total"] += 1
            if r.get("is_relevant") is None:
                counts["classification_failed"] += 1
            elif r["is_relevant"]:
                counts["relevant"] += 1
            else:
                counts["not_relevant"] += 1
            results.append({k: v for k, v in r.items() if k not in ("source_name", "classified_at")})
        summary[name] = counts
        out_path = PROCESSED_DIR / f"relevance_{name}.json"
        out_path.write_text(
            json.dumps({"name": name, "counts": counts, "results": results}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    summary_path = PROCESSED_DIR / "relevance_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"Finalized {len(done)} classified items across {len(by_source)} sources (v2 prompt, checkpoint stopped at 75%).")
    for name, counts in sorted(summary.items()):
        rate = counts["relevant"] / counts["total"] * 100 if counts["total"] else 0
        print(f"  {name}: {counts['relevant']}/{counts['total']} relevant ({rate:.1f}%)")


if __name__ == "__main__":
    main()
