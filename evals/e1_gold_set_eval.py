"""
E1 -- Coding accuracy (the spine). Runs the frozen Coding Agent prompt
(agents/coding_agent_prompt.md, via pipeline/coding_agent.classify_groq)
against every item in the frozen gold set and scores it against the
human labels.

E1 CIRCULARITY GUARD: this gold set has never been used to tune the
prompt (agents/coding_agent_prompt.md's own header states this). This
script MEASURES; it must never be re-run in a loop to iterate the prompt
until the number looks good. If the prompt changes after seeing this
result, a fresh holdout must be drawn and labelled -- per
docs/blueprints/wishlist-conversion-blueprint-v2.md Part E.1 -- and the
change logged in docs/FAILURES.md or docs/decisions/.

Scoring note: the gold set's schema ({id, source, text, relevant,
category}) is coarser than the Coding Agent's own output schema
(is_relevant, primary_barrier, inferred_segment, workaround_observed,
confidence_score). Only relevant<->is_relevant and category<->
primary_barrier are scored here -- inferred_segment and
workaround_observed have no ground truth in this gold set and must be
spot-checked qualitatively, not scored.

Usage:
    .venv/Scripts/python.exe evals/e1_gold_set_eval.py

Reads evals/gold_set/gold_set_final_frozen.jsonl (n=137, 1 item with
relevant=null skipped -- carried-over unresolved tranche 1 row, not a
bug here).
Writes evals/e1_results.json.
"""

import json
import sys
import time
from pathlib import Path

CALL_PACING_SECONDS = 0.3  # spread calls out to avoid Groq 429 rate-limit bursts

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))
from coding_agent import PRIMARY_MODEL, RETRY_MODEL, VALID_BARRIERS, classify_groq  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
GOLD_SET_PATH = ROOT / "evals" / "gold_set" / "gold_set_final_frozen.jsonl"
OUT_PATH = ROOT / "evals" / "e1_results.json"

CATEGORIES = sorted(VALID_BARRIERS)


def expected_category(gold_row: dict) -> str:
    if gold_row.get("relevant"):
        return gold_row.get("category") or "other"
    return "not_relevant"


def precision_recall_f1(tp: int, fp: int, fn: int):
    precision = tp / (tp + fp) if (tp + fp) else None
    recall = tp / (tp + fn) if (tp + fn) else None
    if precision is None or recall is None or (precision + recall) == 0:
        f1 = None
    else:
        f1 = 2 * precision * recall / (precision + recall)
    return precision, recall, f1


def load_gold_set() -> tuple[list[dict], int]:
    all_rows = [
        json.loads(line)
        for line in GOLD_SET_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    usable = [r for r in all_rows if r.get("relevant") is not None]
    n_skipped = len(all_rows) - len(usable)
    return usable, n_skipped


def run_eval(gold_items: list[dict]) -> list[dict]:
    predictions = []
    start = time.time()
    for i, item in enumerate(gold_items, start=1):
        result = classify_groq(item["text"], evidence_id=item["id"])
        predictions.append({"gold": item, "predicted": result})
        time.sleep(CALL_PACING_SECONDS)
        if i % 20 == 0 or i == len(gold_items):
            print(f"  classified {i}/{len(gold_items)} ({time.time() - start:.0f}s elapsed)")
    return predictions


def score(predictions: list[dict]) -> dict:
    scored = [p for p in predictions if p["predicted"].get("is_relevant") is not None]
    failed = len(predictions) - len(scored)

    correct_relevant = sum(1 for p in scored if p["predicted"]["is_relevant"] == p["gold"]["relevant"])
    overall_accuracy = correct_relevant / len(scored) if scored else None

    per_category = {}
    for cat in CATEGORIES:
        tp = fp = fn = 0
        support = 0
        for p in scored:
            expected = expected_category(p["gold"])
            predicted = p["predicted"].get("primary_barrier")
            if expected == cat:
                support += 1
            if predicted == cat and expected == cat:
                tp += 1
            elif predicted == cat and expected != cat:
                fp += 1
            elif predicted != cat and expected == cat:
                fn += 1

        if support == 0:
            per_category[cat] = {
                "precision": None, "recall": None, "f1": None,
                "support": 0, "note": "no gold-set coverage",
            }
            continue

        precision, recall, f1 = precision_recall_f1(tp, fp, fn)
        per_category[cat] = {
            "precision": precision, "recall": recall, "f1": f1,
            "support": support, "tp": tp, "fp": fp, "fn": fn,
        }

    return {
        "n_scored": len(scored),
        "n_classification_failed": failed,
        "overall_is_relevant_accuracy": overall_accuracy,
        "per_category": per_category,
    }


def main() -> None:
    gold_items, n_skipped_null = load_gold_set()
    print(f"Loaded {len(gold_items)} gold-set items ({n_skipped_null} skipped: unresolved null label)")
    print(f"Classifying via {PRIMARY_MODEL} (retry: {RETRY_MODEL})...")

    predictions = run_eval(gold_items)
    metrics = score(predictions)

    failure_errors = [
        {"id": p["gold"]["id"], "error": p["predicted"].get("error")}
        for p in predictions
        if p["predicted"].get("is_relevant") is None
    ]

    # Per-item predictions, for diagnosing exactly which items were missed
    # and how -- not just the aggregate score. This is instrumentation,
    # not a prompt change.
    per_item = [
        {
            "id": p["gold"]["id"],
            "text": p["gold"]["text"],
            "gold_relevant": p["gold"]["relevant"],
            "gold_category": p["gold"]["category"],
            "predicted_is_relevant": p["predicted"].get("is_relevant"),
            "predicted_category": p["predicted"].get("primary_barrier"),
            "predicted_confidence": p["predicted"].get("confidence_score"),
            "error": p["predicted"].get("error"),
        }
        for p in predictions
    ]

    report = {
        "n_gold_items": len(gold_items),
        "n_skipped_null": n_skipped_null,
        "model": f"{PRIMARY_MODEL} (retry: {RETRY_MODEL})",
        "classification_failures": failure_errors,
        **metrics,
        "per_item_predictions": per_item,
    }
    OUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"\n=== E1 results (n={len(gold_items)}, {metrics['n_classification_failed']} classification failures) ===")
    if metrics["overall_is_relevant_accuracy"] is not None:
        print(f"Overall is_relevant accuracy: {metrics['overall_is_relevant_accuracy']:.3f}")
    else:
        print("Overall is_relevant accuracy: n/a (no successfully classified items)")

    print(f"\n{'category':<22}{'precision':<12}{'recall':<12}{'f1':<12}{'support'}")
    for cat, m in metrics["per_category"].items():
        if m["support"] == 0:
            print(f"{cat:<22}{'no gold-set coverage':<36}0")
        else:
            p = f"{m['precision']:.3f}" if m["precision"] is not None else "n/a"
            r = f"{m['recall']:.3f}" if m["recall"] is not None else "n/a"
            f1 = f"{m['f1']:.3f}" if m["f1"] is not None else "n/a"
            print(f"{cat:<22}{p:<12}{r:<12}{f1:<12}{m['support']}")

    print(f"\nFull results written to {OUT_PATH}")
    print("\nReminder: this is a MEASUREMENT, not a tuning loop. Do not edit the prompt and re-run against this same gold set.")


if __name__ == "__main__":
    main()
