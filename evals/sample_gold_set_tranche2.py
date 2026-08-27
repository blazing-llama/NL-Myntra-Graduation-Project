"""
Draw gold-set tranche 2 from the v2-classified corpus (evals/gold_set/,
tranche 2). Per docs/research-findings.md Part 4: fit_size, price_certainty,
occasion_styling, and timing_forgetting are interview-confirmed real but
Play Store corpus-near-zero -- no category labels exist yet (the Coding
Agent hasn't been written), so "weighted toward the sparse categories"
means: include every v2-relevant item across every classified source
(the only pool where a positive example of any category could be sitting),
prioritizing App Store since that's where tranche 1 has zero coverage,
then fill remaining slots with a random not_relevant sample per source for
blind calibration -- same method as tranche 1 (evals/sample_gold_set.py).

Sources: the 5 already-classified v2 sources (data/processed/relevance_
{myntra,ajio,appstore_myntra,appstore_ajio,appstore_nykaa}.json). Excludes
playstore nykaa and reddit -- not yet reached by the v2 checkpoint
(stopped intentionally at 2,203/2,921, see docs/SESSION_HANDOFF.md).

Dedupes against tranche 1 ids (evals/gold_set/item_number_to_id.json) so
no item is shown to the labeller twice.

Usage:
    .venv/Scripts/python.exe evals/sample_gold_set_tranche2.py

Writes evals/gold_set/candidates_tranche2.jsonl,
evals/gold_set/candidates_for_labeling_tranche2.csv,
evals/gold_set/item_number_to_id_tranche2.json.

Output is for user review before labeling -- do not hand-label from this
script's output without a stop/review checkpoint first.
"""

import csv
import json
import random
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
GOLD_SET_DIR = Path(__file__).resolve().parent / "gold_set"

SOURCES = ["myntra", "ajio", "appstore_myntra", "appstore_ajio", "appstore_nykaa"]
TARGET_TOTAL = 35  # mid-range of the 30-40 target
SEED = 42


def main() -> None:
    random.seed(SEED)
    GOLD_SET_DIR.mkdir(parents=True, exist_ok=True)

    # item_number_to_id.json is keyed by item_number, not by review id -- pull the actual review ids
    tranche1_map = json.loads((GOLD_SET_DIR / "item_number_to_id.json").read_text(encoding="utf-8"))
    tranche1_ids = {v["id"] for v in tranche1_map.values()}

    selected: list[dict] = []
    stats = {}

    for name in SOURCES:
        rel_path = PROCESSED_DIR / f"relevance_{name}.json"
        if not rel_path.exists():
            print(f"  [skip] {name}: no relevance_{name}.json")
            continue
        data = json.loads(rel_path.read_text(encoding="utf-8"))
        results = data["results"]

        relevant = [r for r in results if r.get("is_relevant") and r["id"] not in tranche1_ids]

        for r in relevant:
            r["_source_name"] = name
        stats[name] = {"relevant_included": len(relevant), "not_relevant_sampled": 0, "total": len(relevant)}
        selected.extend(relevant)

    # fill remaining slots up to TARGET_TOTAL with not_relevant filler,
    # spread evenly across sources, for blind calibration (matches tranche 1)
    remaining = max(TARGET_TOTAL - len(selected), 0)
    if remaining > 0:
        per_source_fill = max(remaining // len(SOURCES), 1)
        for name in SOURCES:
            rel_path = PROCESSED_DIR / f"relevance_{name}.json"
            if not rel_path.exists():
                continue
            data = json.loads(rel_path.read_text(encoding="utf-8"))
            not_relevant = [
                r for r in data["results"]
                if r.get("is_relevant") is False and r["id"] not in tranche1_ids
            ]
            n = min(per_source_fill, len(not_relevant), remaining)
            if n <= 0:
                continue
            sampled = random.sample(not_relevant, n)
            for r in sampled:
                r["_source_name"] = name
            selected.extend(sampled)
            stats[name]["not_relevant_sampled"] = n
            stats[name]["total"] += n
            remaining -= n

    random.shuffle(selected)  # blind labelling: no relevant/not_relevant grouping pattern

    jsonl_path = GOLD_SET_DIR / "candidates_tranche2.jsonl"
    with jsonl_path.open("w", encoding="utf-8") as f:
        for item in selected:
            row = {"id": item["id"], "source_name": item.get("_source_name"), "text": item["text"], "label": ""}
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    csv_path = GOLD_SET_DIR / "candidates_for_labeling_tranche2.csv"
    mapping = {}
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["item_number", "text", "relevant", "category"])
        for i, item in enumerate(selected, start=1):
            writer.writerow([i, item["text"], "", ""])
            mapping[str(i)] = {"id": item["id"], "source": "v2_checkpoint"}

    mapping_path = GOLD_SET_DIR / "item_number_to_id_tranche2.json"
    mapping_path.write_text(json.dumps(mapping, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(selected)} tranche-2 candidates to {jsonl_path}")
    print(f"Blind labeling CSV: {csv_path}")
    print(f"Mapping (do not show to labeller): {mapping_path}")
    for name, s in stats.items():
        print(f"  {name}: {s}")


if __name__ == "__main__":
    main()
