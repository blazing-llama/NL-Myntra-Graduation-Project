"""
Supplementary recall check for gold-set tranche 2.

tranche 2 as drawn (sample_gold_set_tranche2.py) pulled only v2-relevant
items -- that tests classifier precision but says nothing about recall.
This script samples a small set of v2 NOT-relevant items that mention
save/wishlist/bookmark/size/occasion language -- the likeliest false
negatives -- and appends them into the existing tranche 2 files (shuffled
in, not separated), so the blind labeller sees one mixed set.

Usage:
    .venv/Scripts/python.exe evals/sample_gold_set_tranche2_recall.py

Reads/overwrites evals/gold_set/candidates_tranche2.jsonl,
candidates_for_labeling_tranche2.csv, item_number_to_id_tranche2.json.
"""

import csv
import json
import random
import re
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
GOLD_SET_DIR = Path(__file__).resolve().parent / "gold_set"

SOURCES = ["myntra", "ajio", "appstore_myntra", "appstore_ajio", "appstore_nykaa"]
N_SUPPLEMENT = 12
SEED = 43  # different from tranche 2's own seed, so this draw is independent

KEYWORD_RE = re.compile(
    r"\b(wishlist|bookmark(ed)?|sav(e|ed|ing)|size|siz(e|ing)|fit(ting)?|"
    r"occasion|wear(ing)?|style|styling)\b",
    re.IGNORECASE,
)


def main() -> None:
    random.seed(SEED)

    existing = [json.loads(line) for line in (GOLD_SET_DIR / "candidates_tranche2.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    existing_ids = {item["id"] for item in existing}

    tranche1_map = json.loads((GOLD_SET_DIR / "item_number_to_id.json").read_text(encoding="utf-8"))
    tranche1_ids = {v["id"] for v in tranche1_map.values()}

    pool = []
    for name in SOURCES:
        rel_path = PROCESSED_DIR / f"relevance_{name}.json"
        if not rel_path.exists():
            continue
        data = json.loads(rel_path.read_text(encoding="utf-8"))
        for r in data["results"]:
            if r.get("is_relevant") is not False:
                continue
            if r["id"] in existing_ids or r["id"] in tranche1_ids:
                continue
            if KEYWORD_RE.search(r["text"] or ""):
                r = dict(r)
                r["_source_name"] = name
                pool.append(r)

    n = min(N_SUPPLEMENT, len(pool))
    supplement = random.sample(pool, n)

    combined = existing + [
        {"id": item["id"], "source_name": item.get("_source_name") or item.get("source_name"), "text": item["text"], "label": ""}
        for item in supplement
    ]
    random.shuffle(combined)

    jsonl_path = GOLD_SET_DIR / "candidates_tranche2.jsonl"
    with jsonl_path.open("w", encoding="utf-8") as f:
        for item in combined:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    csv_path = GOLD_SET_DIR / "candidates_for_labeling_tranche2.csv"
    mapping = {}
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["item_number", "text", "relevant", "category"])
        for i, item in enumerate(combined, start=1):
            writer.writerow([i, item["text"], "", ""])
            mapping[str(i)] = {"id": item["id"], "source": "v2_checkpoint"}

    mapping_path = GOLD_SET_DIR / "item_number_to_id_tranche2.json"
    mapping_path.write_text(json.dumps(mapping, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Added {n} not-relevant recall-check candidates (keyword-flagged, sampled from {len(pool)} eligible).")
    print(f"Total tranche 2 rows now: {len(combined)}")


if __name__ == "__main__":
    main()
