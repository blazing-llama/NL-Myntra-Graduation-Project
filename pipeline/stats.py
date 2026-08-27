"""
Deterministic aggregation of Coding Agent output. No LLM calls here --
"the agent labels one item, Python counts" is the rule from day one
(docs/blueprints/02_AGENT_ORCHESTRATION.md, "What this agent must never
do") and it holds here too: nothing in this file computes a
classification, only counts and rates over classifications already made.

Input: a list of Coding Agent result dicts, matching pipeline/
coding_agent.py's output schema (evidence_id, is_relevant,
primary_barrier, inferred_segment, workaround_observed, confidence_score),
each optionally tagged with a "source_name" key (which app/source it
came from -- pipeline/run_v2_full_pass.py's convention).

Usage as a library:
    from pipeline.stats import relevant_rate_by_source, category_distribution, compare_to_gold

Usage as a script:
    .venv/Scripts/python.exe pipeline/stats.py <results.jsonl> [--gold evals/gold_set/gold_set_final_frozen.jsonl]
"""

import argparse
import json
from pathlib import Path

ALL_BARRIERS = [
    "fit_size", "price_certainty", "occasion_styling", "quality_trust",
    "availability_decay", "timing_forgetting", "bookmark_not_intent",
    "other", "not_relevant",
]


def relevant_rate_by_source(results: list[dict]) -> dict[str, dict]:
    by_source: dict[str, dict] = {}
    for r in results:
        source = r.get("source_name", "unknown")
        bucket = by_source.setdefault(source, {"total": 0, "relevant": 0, "not_relevant": 0, "failed": 0})
        bucket["total"] += 1
        if r.get("is_relevant") is None:
            bucket["failed"] += 1
        elif r["is_relevant"]:
            bucket["relevant"] += 1
        else:
            bucket["not_relevant"] += 1

    for bucket in by_source.values():
        denom = bucket["total"] - bucket["failed"]
        bucket["relevant_rate"] = bucket["relevant"] / denom if denom else None

    return by_source


def category_distribution(results: list[dict], relevant_only: bool = True) -> dict[str, int]:
    counts = {b: 0 for b in ALL_BARRIERS}
    for r in results:
        if relevant_only and not r.get("is_relevant"):
            continue
        barrier = r.get("primary_barrier")
        if barrier in counts:
            counts[barrier] += 1
    return counts


def compare_to_gold(results: list[dict], gold_items: list[dict]) -> dict:
    """Compares the classifier's own category distribution against the
    gold set's human-labelled distribution, restricted to items the
    classifier actually scored that also appear in the gold set (matched
    by id/evidence_id). This is a sanity check on classifier output, not
    an accuracy measure -- see evals/e1_gold_set_eval.py for accuracy."""
    gold_by_id = {g["id"]: g for g in gold_items}

    id_key = "evidence_id" if results and "evidence_id" in results[0] else "id"
    overlap = [r for r in results if r.get(id_key) in gold_by_id]

    # relevant_only=False so not_relevant items are counted here too --
    # otherwise this would never match gold_dist, which always counts them.
    pred_dist = category_distribution(overlap, relevant_only=False)

    gold_dist = {b: 0 for b in ALL_BARRIERS}
    for r in overlap:
        gold_row = gold_by_id[r[id_key]]
        if gold_row.get("relevant"):
            cat = gold_row.get("category")
            if cat in gold_dist:
                gold_dist[cat] += 1
        elif gold_row.get("relevant") is False:
            gold_dist["not_relevant"] += 1

    return {"n_overlap": len(overlap), "predicted": pred_dist, "gold": gold_dist}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results_path", help="JSONL file of Coding Agent output")
    parser.add_argument("--gold", default=None, help="Optional gold-set JSONL to compare distributions against")
    args = parser.parse_args()

    results = [
        json.loads(line)
        for line in Path(args.results_path).read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    print("Relevant rate by source:")
    for source, bucket in sorted(relevant_rate_by_source(results).items()):
        rate = f"{bucket['relevant_rate'] * 100:.1f}%" if bucket["relevant_rate"] is not None else "n/a"
        print(f"  {source}: {bucket['relevant']}/{bucket['total']} relevant ({rate}), {bucket['failed']} classification failures")

    print("\nCategory distribution (relevant items only):")
    for cat, count in category_distribution(results).items():
        if count:
            print(f"  {cat}: {count}")

    if args.gold:
        gold_items = [
            json.loads(line)
            for line in Path(args.gold).read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        comparison = compare_to_gold(results, gold_items)
        print(f"\nComparison against gold set ({comparison['n_overlap']} overlapping items):")
        print(f"  predicted: {comparison['predicted']}")
        print(f"  gold:      {comparison['gold']}")


if __name__ == "__main__":
    main()
