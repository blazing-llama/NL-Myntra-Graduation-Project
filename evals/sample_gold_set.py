"""
Sample candidates for hand-labelling into the gold set (v2 Part E, E1
circularity guard — this must happen before agents/coding_agent_prompt.md
is written or tuned).

Stratified across all three apps (not just the eventual winning source),
includes every item the Phase 1 relevance pre-filter flagged relevant
(small population, high value for codebook edge cases), fills the rest
with a random sample of pilot-not_relevant items per app, then shuffles
so relevant/not_relevant items aren't grouped — the human labeller sees
no hint of the pilot's own verdict (blind labelling, per E1).

Usage:
    .venv/Scripts/python.exe evals/sample_gold_set.py

Reads data/processed/clean_<app>.json + relevance_<app>.json,
writes evals/gold_set/candidates.jsonl.
"""

import json
import random
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
GOLD_SET_DIR = Path(__file__).resolve().parent / "gold_set"

APPS = ["myntra", "ajio", "nykaa"]
PER_APP_TARGET = 30  # 3 apps x 30 = 90, mid-range of the 60-100 target
SEED = 42


def main() -> None:
    random.seed(SEED)
    GOLD_SET_DIR.mkdir(parents=True, exist_ok=True)

    selected: list[dict] = []
    stats = {}

    for app in APPS:
        clean = json.loads((PROCESSED_DIR / f"clean_{app}.json").read_text(encoding="utf-8"))
        relevance = json.loads((PROCESSED_DIR / f"relevance_{app}.json").read_text(encoding="utf-8"))

        text_by_id = {item["id"]: item for item in clean["items"]}
        relevant_ids = {r["id"] for r in relevance["results"] if r.get("is_relevant")}
        not_relevant_ids = [
            r["id"] for r in relevance["results"] if r.get("is_relevant") is False
        ]

        app_selection = [text_by_id[i] for i in relevant_ids if i in text_by_id]

        remaining_slots = max(PER_APP_TARGET - len(app_selection), 0)
        sample_pool = [i for i in not_relevant_ids if i in text_by_id]
        sampled_not_relevant = random.sample(sample_pool, min(remaining_slots, len(sample_pool)))
        app_selection += [text_by_id[i] for i in sampled_not_relevant]

        stats[app] = {
            "pilot_relevant_included": len(relevant_ids),
            "not_relevant_sampled": len(sampled_not_relevant),
            "total": len(app_selection),
        }
        selected.extend(app_selection)

    random.shuffle(selected)  # blind labelling: no relevant/not_relevant grouping pattern

    out_path = GOLD_SET_DIR / "candidates.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for item in selected:
            row = {
                "id": item["id"],
                "app_name": item["meta"].get("app_name"),
                "text": item["text"],
                "label": "",
            }
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"Wrote {len(selected)} candidates to {out_path}")
    for app, s in stats.items():
        print(f"  {app}: {s}")


if __name__ == "__main__":
    main()
