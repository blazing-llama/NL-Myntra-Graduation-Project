"""
Merge tranche 1 (frozen) + tranche 2 (resolved, double-labeled +
tie-broken by the project owner) into the final frozen gold set.

Tranche 2's resolved relevant/category values were provided directly by
the user as an ordered list (item_number -> relevant, category), since
the labeled CSV lives outside this repo. This script cross-references
those item_numbers against evals/gold_set/item_number_to_id_tranche2.json
(id/source) and evals/gold_set/candidates_tranche2.jsonl (text), so the
actual text is pulled from the repo's own data rather than retyped.

Usage:
    .venv/Scripts/python.exe evals/merge_gold_set.py

Reads: gold_set_playstore_tranche.jsonl (90, tranche 1),
       item_number_to_id_tranche2.json, candidates_tranche2.jsonl (47, tranche 2)
Writes: gold_set_final_frozen.jsonl (137)
"""

import json
from pathlib import Path

GOLD_SET_DIR = Path(__file__).resolve().parent / "gold_set"

# item_number -> (relevant, category), as resolved by the project owner
# after double-labeling (89.4% raw agreement, 100% category agreement on
# agreed-relevant items) + 5 tie-breaks.
TRANCHE2_RESOLVED = {
    1: (False, None), 2: (False, None), 3: (True, "price_certainty"),
    4: (True, "price_certainty"), 5: (False, None), 6: (False, None),
    7: (True, "fit_size"), 8: (False, None), 9: (True, "availability_decay"),
    10: (False, None), 11: (True, "fit_size"), 12: (False, None),
    13: (True, "quality_trust"), 14: (True, "fit_size"), 15: (True, "price_certainty"),
    16: (False, None), 17: (False, None), 18: (False, None),
    19: (True, "fit_size"), 20: (False, None), 21: (False, None),
    22: (False, None), 23: (False, None), 24: (False, None),
    25: (True, "availability_decay"), 26: (True, "availability_decay"), 27: (False, None),
    28: (True, "quality_trust"), 29: (False, None), 30: (True, "price_certainty"),
    31: (True, "price_certainty"), 32: (True, "price_certainty"), 33: (True, "availability_decay"),
    34: (True, "price_certainty"), 35: (True, "fit_size"), 36: (False, None),
    37: (False, None), 38: (False, None), 39: (False, None),
    40: (False, None), 41: (True, "fit_size"), 42: (False, None),
    43: (False, None), 44: (True, "quality_trust"), 45: (False, None),
    46: (False, None), 47: (True, "quality_trust"),
}


def main() -> None:
    assert len(TRANCHE2_RESOLVED) == 47

    mapping = json.loads((GOLD_SET_DIR / "item_number_to_id_tranche2.json").read_text(encoding="utf-8"))
    candidates = {}
    for line in (GOLD_SET_DIR / "candidates_tranche2.jsonl").read_text(encoding="utf-8").splitlines():
        if line.strip():
            row = json.loads(line)
            candidates[row["id"]] = row

    tranche2_final = []
    for item_number, (relevant, category) in TRANCHE2_RESOLVED.items():
        m = mapping[str(item_number)]
        item_id = m["id"]
        cand = candidates[item_id]
        source = "appstore" if item_id.startswith("appstore-") else "playstore"
        tranche2_final.append({
            "id": item_id,
            "source": source,
            "text": cand["text"],
            "relevant": relevant,
            "category": category,
        })

    tranche1 = [
        json.loads(line)
        for line in (GOLD_SET_DIR / "gold_set_playstore_tranche.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    final = tranche1 + tranche2_final
    out_path = GOLD_SET_DIR / "gold_set_final_frozen.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for row in final:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    total = len(final)
    relevant_count = sum(1 for r in final if r.get("relevant") is True)
    not_relevant_count = sum(1 for r in final if r.get("relevant") is False)
    null_count = sum(1 for r in final if r.get("relevant") is None)

    categories = {}
    for r in final:
        if r.get("relevant") is True:
            categories[r.get("category")] = categories.get(r.get("category"), 0) + 1

    print(f"Wrote {total} items to {out_path}")
    print(f"  relevant: {relevant_count}, not_relevant: {not_relevant_count}, null(unresolved): {null_count}")
    print("Category breakdown (relevant items only):")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    all_categories = [
        "fit_size", "price_certainty", "occasion_styling", "quality_trust",
        "availability_decay", "timing_forgetting", "bookmark_not_intent", "other",
    ]
    zero_categories = [c for c in all_categories if categories.get(c, 0) == 0]
    print(f"Categories at zero: {zero_categories}")


if __name__ == "__main__":
    main()
