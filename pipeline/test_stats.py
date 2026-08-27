"""
Unit tests for pipeline/stats.py -- pure functions, no LLM calls, no
network. Exercises the aggregation logic against the frozen gold set
only (treating its human labels as if they were Coding Agent output),
since the Coding Agent has not been run against real data yet.

Usage:
    .venv/Scripts/python.exe pipeline/test_stats.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from stats import ALL_BARRIERS, category_distribution, compare_to_gold, relevant_rate_by_source  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
GOLD_SET_PATH = ROOT / "evals" / "gold_set" / "gold_set_final_frozen.jsonl"


def load_gold():
    return [
        json.loads(line)
        for line in GOLD_SET_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def as_fake_coding_agent_output(gold_row: dict, source_name: str = "test_source") -> dict:
    """Reshapes a gold-set row into the Coding Agent's own output schema,
    so relevant_rate_by_source/category_distribution (which expect that
    schema) can be exercised without an actual model call."""
    return {
        "evidence_id": gold_row["id"],
        "is_relevant": gold_row["relevant"],
        "primary_barrier": gold_row["category"] if gold_row["relevant"] else "not_relevant",
        "source_name": source_name,
    }


def test_relevant_rate_by_source_basic():
    fake_results = [
        {"is_relevant": True, "primary_barrier": "fit_size", "source_name": "a"},
        {"is_relevant": False, "primary_barrier": "not_relevant", "source_name": "a"},
        {"is_relevant": False, "primary_barrier": "not_relevant", "source_name": "b"},
        {"is_relevant": None, "primary_barrier": None, "source_name": "b"},
    ]
    rates = relevant_rate_by_source(fake_results)
    assert rates["a"]["total"] == 2
    assert rates["a"]["relevant"] == 1
    assert rates["a"]["relevant_rate"] == 0.5
    assert rates["b"]["total"] == 2
    assert rates["b"]["failed"] == 1
    assert rates["b"]["relevant_rate"] == 0.0  # 0 relevant out of 1 non-failed
    print("test_relevant_rate_by_source_basic PASSED")


def test_relevant_rate_by_source_all_failed_no_division_error():
    fake_results = [{"is_relevant": None, "primary_barrier": None, "source_name": "a"}]
    rates = relevant_rate_by_source(fake_results)
    assert rates["a"]["relevant_rate"] is None  # must not raise ZeroDivisionError
    print("test_relevant_rate_by_source_all_failed_no_division_error PASSED")


def test_category_distribution_relevant_only_default():
    fake_results = [
        {"is_relevant": True, "primary_barrier": "fit_size"},
        {"is_relevant": True, "primary_barrier": "fit_size"},
        {"is_relevant": False, "primary_barrier": "not_relevant"},
        {"is_relevant": True, "primary_barrier": "price_certainty"},
    ]
    dist = category_distribution(fake_results)
    assert dist["fit_size"] == 2
    assert dist["price_certainty"] == 1
    assert dist["not_relevant"] == 0  # excluded because relevant_only defaults True
    assert set(dist.keys()) == set(ALL_BARRIERS)
    print("test_category_distribution_relevant_only_default PASSED")


def test_category_distribution_against_real_gold_set():
    gold = load_gold()
    gold = [g for g in gold if g.get("relevant") is not None]  # drop item 87's unresolved null
    fake_results = [as_fake_coding_agent_output(g) for g in gold]

    dist = category_distribution(fake_results)
    # cross-check against the known-frozen distribution reported in
    # docs/experiment_manifest.md (EXP-005)
    assert dist["price_certainty"] == 11
    assert dist["quality_trust"] == 7
    assert dist["fit_size"] == 6
    assert dist["availability_decay"] == 5
    assert dist["occasion_styling"] == 0
    assert dist["timing_forgetting"] == 0
    assert dist["bookmark_not_intent"] == 0
    print("test_category_distribution_against_real_gold_set PASSED")


def test_compare_to_gold_perfect_agreement_when_fed_its_own_labels():
    gold = load_gold()
    gold = [g for g in gold if g.get("relevant") is not None]
    fake_results = [as_fake_coding_agent_output(g) for g in gold]

    comparison = compare_to_gold(fake_results, gold)
    assert comparison["n_overlap"] == len(gold)
    assert comparison["predicted"] == comparison["gold"]
    print("test_compare_to_gold_perfect_agreement_when_fed_its_own_labels PASSED")


def test_compare_to_gold_partial_overlap():
    gold = load_gold()
    gold = [g for g in gold if g.get("relevant") is not None]
    subset = gold[:10]
    fake_results = [as_fake_coding_agent_output(g) for g in subset]
    # add one result with an id not present in the gold set at all
    fake_results.append({"evidence_id": "not-in-gold-set", "is_relevant": True, "primary_barrier": "fit_size"})

    comparison = compare_to_gold(fake_results, gold)
    assert comparison["n_overlap"] == 10  # the unmatched id must not be counted
    print("test_compare_to_gold_partial_overlap PASSED")


if __name__ == "__main__":
    test_relevant_rate_by_source_basic()
    test_relevant_rate_by_source_all_failed_no_division_error()
    test_category_distribution_relevant_only_default()
    test_category_distribution_against_real_gold_set()
    test_compare_to_gold_perfect_agreement_when_fed_its_own_labels()
    test_compare_to_gold_partial_overlap()
    print("\nAll pipeline/stats.py tests passed.")
