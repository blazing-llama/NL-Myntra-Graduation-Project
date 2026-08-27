"""
Unit tests for evals/e1_gold_set_eval.py's pure scoring logic. No network
calls, no Groq required -- exercises expected_category(), precision_recall_f1(),
and score() against synthetic predictions plus the real frozen gold set's
labels (never against a live classification run).

Usage:
    .venv/Scripts/python.exe evals/test_e1_gold_set_eval.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from e1_gold_set_eval import expected_category, load_gold_set, precision_recall_f1, score  # noqa: E402


def test_expected_category_relevant_item():
    assert expected_category({"relevant": True, "category": "fit_size"}) == "fit_size"
    print("test_expected_category_relevant_item PASSED")


def test_expected_category_not_relevant_item():
    assert expected_category({"relevant": False, "category": None}) == "not_relevant"
    print("test_expected_category_not_relevant_item PASSED")


def test_expected_category_relevant_but_no_category_defaults_other():
    assert expected_category({"relevant": True, "category": None}) == "other"
    print("test_expected_category_relevant_but_no_category_defaults_other PASSED")


def test_precision_recall_f1_perfect():
    p, r, f1 = precision_recall_f1(tp=10, fp=0, fn=0)
    assert p == 1.0 and r == 1.0 and f1 == 1.0
    print("test_precision_recall_f1_perfect PASSED")


def test_precision_recall_f1_no_predictions_no_division_error():
    p, r, f1 = precision_recall_f1(tp=0, fp=0, fn=5)
    assert p is None  # tp+fp == 0, must not raise ZeroDivisionError
    assert r == 0.0
    assert f1 is None
    print("test_precision_recall_f1_no_predictions_no_division_error PASSED")


def test_precision_recall_f1_known_values():
    # tp=3, fp=1 -> precision=0.75; tp=3, fn=2 -> recall=0.6
    p, r, f1 = precision_recall_f1(tp=3, fp=1, fn=2)
    assert abs(p - 0.75) < 1e-9
    assert abs(r - 0.6) < 1e-9
    expected_f1 = 2 * 0.75 * 0.6 / (0.75 + 0.6)
    assert abs(f1 - expected_f1) < 1e-9
    print("test_precision_recall_f1_known_values PASSED")


def test_score_perfect_classifier():
    """A 'classifier' that just echoes the gold label back should score
    1.0 accuracy and 1.0 precision/recall/F1 on every category it has
    support for."""
    gold_items, _ = load_gold_set()
    predictions = []
    for g in gold_items:
        predicted_barrier = expected_category(g)
        predictions.append({
            "gold": g,
            "predicted": {"is_relevant": g["relevant"], "primary_barrier": predicted_barrier},
        })

    metrics = score(predictions)
    assert metrics["n_classification_failed"] == 0
    assert metrics["overall_is_relevant_accuracy"] == 1.0
    for cat, m in metrics["per_category"].items():
        if m["support"] > 0:
            assert m["precision"] == 1.0, f"{cat} precision"
            assert m["recall"] == 1.0, f"{cat} recall"
            assert m["f1"] == 1.0, f"{cat} f1"
        else:
            assert m["note"] == "no gold-set coverage"
    print("test_score_perfect_classifier PASSED")


def test_score_classifier_that_always_says_not_relevant():
    """A degenerate classifier that always predicts not_relevant should
    have 0 recall on every real category, but its overall is_relevant
    accuracy should equal the not-relevant fraction of the gold set."""
    gold_items, _ = load_gold_set()
    predictions = [
        {"gold": g, "predicted": {"is_relevant": False, "primary_barrier": "not_relevant"}}
        for g in gold_items
    ]
    metrics = score(predictions)
    n_not_relevant = sum(1 for g in gold_items if g["relevant"] is False)
    expected_accuracy = n_not_relevant / len(gold_items)
    assert abs(metrics["overall_is_relevant_accuracy"] - expected_accuracy) < 1e-9

    for cat in ("fit_size", "price_certainty", "quality_trust", "availability_decay"):
        m = metrics["per_category"][cat]
        assert m["support"] > 0
        assert m["recall"] == 0.0
    print("test_score_classifier_that_always_says_not_relevant PASSED")


def test_score_handles_classification_failures():
    gold_items, _ = load_gold_set()
    predictions = [
        {"gold": g, "predicted": {"is_relevant": None, "primary_barrier": None}}
        for g in gold_items[:5]
    ]
    predictions += [
        {"gold": g, "predicted": {"is_relevant": g["relevant"], "primary_barrier": expected_category(g)}}
        for g in gold_items[5:15]
    ]
    metrics = score(predictions)
    assert metrics["n_classification_failed"] == 5
    assert metrics["n_scored"] == 10
    print("test_score_handles_classification_failures PASSED")


def test_load_gold_set_skips_unresolved_null():
    gold_items, n_skipped = load_gold_set()
    assert n_skipped == 1  # tranche 1's item 87, still blank
    assert all(g.get("relevant") is not None for g in gold_items)
    assert len(gold_items) == 136
    print("test_load_gold_set_skips_unresolved_null PASSED")


if __name__ == "__main__":
    test_expected_category_relevant_item()
    test_expected_category_not_relevant_item()
    test_expected_category_relevant_but_no_category_defaults_other()
    test_precision_recall_f1_perfect()
    test_precision_recall_f1_no_predictions_no_division_error()
    test_precision_recall_f1_known_values()
    test_score_perfect_classifier()
    test_score_classifier_that_always_says_not_relevant()
    test_score_handles_classification_failures()
    test_load_gold_set_skips_unresolved_null()
    print("\nAll evals/e1_gold_set_eval.py scoring tests passed.")
