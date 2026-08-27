"""
E3 -- Cross-model robustness (NOT validation). Per docs/blueprints/
02_AGENT_ORCHESTRATION.md "Cross-model check (E3) wiring": run the same
frozen Coding Agent prompt against two different models on the same
sample, compute Cohen's kappa. Agreement tells you the models agree with
each other -- it does NOT tell you either is correct. E1
(gold_set_final_frozen.jsonl) remains the only accuracy measure.

Model substitution note: the blueprint specifies hermes3:8b via Ollama
as Model B. hermes3:8b has never successfully pulled in this environment
(docs/FAILURES.md, 2026-08-19 entry -- 4.7GB pull didn't complete).
Substituted llama3.2:3b -- a genuinely distinct model family/size from
openai/gpt-oss-20b, already installed locally and verified responsive --
same substitution convention as pipeline/relevance_prefilter.py's pilot.
Revisit once hermes3:8b (or an equivalent) is actually available.

Scope note: this task builds and unit-tests against the gold set only,
not the blueprint's originally-specified 200-item full-corpus sample --
the full corpus has not been run through the Coding Agent yet. Sample
size defaults to the full gold set (n<=136); pass --sample-size to draw
a smaller random subset once this is pointed at the full corpus later.

Usage:
    .venv/Scripts/python.exe evals/e3_cross_model_agreement.py [--sample-size N]

Writes evals/e3_results.json.
"""

import argparse
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))
from coding_agent import classify_groq, classify_ollama  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
GOLD_SET_PATH = ROOT / "evals" / "gold_set" / "gold_set_final_frozen.jsonl"
OUT_PATH = ROOT / "evals" / "e3_results.json"

MODEL_A_NAME = "openai/gpt-oss-20b (Groq)"
OLLAMA_MODEL = "llama3.2:3b"
MODEL_B_NAME = f"{OLLAMA_MODEL} (Ollama, substituted for hermes3:8b -- see module docstring)"
SEED = 42


def cohens_kappa(labels_a: list[str], labels_b: list[str]) -> float | None:
    """Manual implementation -- avoids adding scikit-learn as a new
    shared-venv dependency for one metric (see docs/FAILURES.md
    2026-08-24 re: an unmaintained package silently breaking shared
    deps -- new installs into this venv get checked twice now)."""
    assert len(labels_a) == len(labels_b)
    n = len(labels_a)
    if n == 0:
        return None

    categories = sorted(set(labels_a) | set(labels_b))
    index = {c: i for i, c in enumerate(categories)}
    k = len(categories)

    confusion = [[0] * k for _ in range(k)]
    for a, b in zip(labels_a, labels_b):
        confusion[index[a]][index[b]] += 1

    observed_agreement = sum(confusion[i][i] for i in range(k)) / n
    row_totals = [sum(row) / n for row in confusion]
    col_totals = [sum(confusion[i][j] for i in range(k)) / n for j in range(k)]
    expected_agreement = sum(row_totals[i] * col_totals[i] for i in range(k))

    if expected_agreement >= 1.0:
        return 1.0  # every label identical on both sides -- perfect, undefined denominator otherwise
    return (observed_agreement - expected_agreement) / (1 - expected_agreement)


def load_gold_set() -> list[dict]:
    rows = [
        json.loads(line)
        for line in GOLD_SET_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    return [r for r in rows if r.get("relevant") is not None]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample-size", type=int, default=136)
    args = parser.parse_args()

    random.seed(SEED)
    gold_items = load_gold_set()
    sample = random.sample(gold_items, min(args.sample_size, len(gold_items)))

    print(f"Model A: {MODEL_A_NAME}")
    print(f"Model B: {MODEL_B_NAME}")
    print(f"Sampling {len(sample)} items from the frozen gold set...")

    rows = []
    for i, item in enumerate(sample, start=1):
        result_a = classify_groq(item["text"], evidence_id=item["id"])
        result_b = classify_ollama(item["text"], evidence_id=item["id"], model=OLLAMA_MODEL)
        rows.append({"id": item["id"], "model_a": result_a, "model_b": result_b})
        if i % 20 == 0 or i == len(sample):
            print(f"  classified {i}/{len(sample)}")

    valid_rows = [r for r in rows if r["model_a"].get("primary_barrier") and r["model_b"].get("primary_barrier")]
    dropped = len(rows) - len(valid_rows)

    barrier_a = [r["model_a"]["primary_barrier"] for r in valid_rows]
    barrier_b = [r["model_b"]["primary_barrier"] for r in valid_rows]
    kappa_barrier = cohens_kappa(barrier_a, barrier_b)

    relevant_a = [str(r["model_a"]["is_relevant"]) for r in valid_rows]
    relevant_b = [str(r["model_b"]["is_relevant"]) for r in valid_rows]
    kappa_relevant = cohens_kappa(relevant_a, relevant_b)

    raw_agreement = (
        sum(1 for a, b in zip(barrier_a, barrier_b) if a == b) / len(valid_rows) if valid_rows else None
    )

    report = {
        "n_sampled": len(sample),
        "n_scored": len(valid_rows),
        "n_dropped_classification_failure": dropped,
        "model_a": MODEL_A_NAME,
        "model_b": MODEL_B_NAME,
        "raw_agreement_primary_barrier": raw_agreement,
        "cohens_kappa_primary_barrier": kappa_barrier,
        "cohens_kappa_is_relevant": kappa_relevant,
        "note": "Cross-model AGREEMENT, not validation. Does not establish either model is correct -- see evals/e1_gold_set_eval.py for accuracy.",
    }
    OUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"\n=== E3 cross-model agreement (n={len(valid_rows)}/{len(sample)} scored, {dropped} dropped) ===")
    print(f"Raw agreement (primary_barrier): {raw_agreement:.3f}" if raw_agreement is not None else "Raw agreement: n/a")
    print(f"Cohen's kappa (primary_barrier): {kappa_barrier:.3f}" if kappa_barrier is not None else "Cohen's kappa (primary_barrier): n/a")
    print(f"Cohen's kappa (is_relevant):     {kappa_relevant:.3f}" if kappa_relevant is not None else "Cohen's kappa (is_relevant): n/a")
    print("\nLabel this 'cross-model agreement / robustness' -- never 'validation'. E1 remains the only accuracy measure.")
    print(f"\nFull results written to {OUT_PATH}")


if __name__ == "__main__":
    main()
