"""
Unit tests for evals/e3_cross_model_agreement.py's cohens_kappa()
implementation. No network calls, no models required -- checked against
known reference values.

Usage:
    .venv/Scripts/python.exe evals/test_e3_cross_model_agreement.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from e3_cross_model_agreement import cohens_kappa  # noqa: E402


def test_perfect_agreement():
    a = ["fit_size", "price_certainty", "not_relevant", "fit_size"]
    b = ["fit_size", "price_certainty", "not_relevant", "fit_size"]
    assert cohens_kappa(a, b) == 1.0
    print("test_perfect_agreement PASSED")


def test_empty_input_returns_none_not_error():
    assert cohens_kappa([], []) is None
    print("test_empty_input_returns_none_not_error PASSED")


def test_known_reference_value():
    # Standard textbook example (Wikipedia "Cohen's kappa" 2x2 example):
    # 20 items: both say yes 15 times, both say no 0 times would be trivial;
    # use the classic asymmetric example instead --
    # rater A: yes x20, no x5 ; rater B: yes x15, no x10 ; agree on yes x15, agree on no x5
    a = ["yes"] * 20 + ["no"] * 5
    b = ["yes"] * 15 + ["no"] * 5 + ["yes"] * 5
    # confusion: (yes,yes)=15, (yes,no)=0->wait construct exactly
    # Build explicit pairs instead of concatenation to avoid misalignment:
    pairs = (
        [("yes", "yes")] * 15
        + [("yes", "no")] * 5
        + [("no", "yes")] * 0
        + [("no", "no")] * 5
    )
    a = [p[0] for p in pairs]
    b = [p[1] for p in pairs]
    n = len(a)
    assert n == 25
    observed = (15 + 5) / n  # 0.8
    # marginals: A: yes=20,no=5 (0.8,0.2) ; B: yes=15,no=10 (0.6,0.4)
    expected = 0.8 * 0.6 + 0.2 * 0.4  # 0.48+0.08=0.56
    known_kappa = (observed - expected) / (1 - expected)
    result = cohens_kappa(a, b)
    assert abs(result - known_kappa) < 1e-9
    print(f"test_known_reference_value PASSED (kappa={result:.4f})")


def test_systematic_disagreement_gives_low_or_negative_kappa():
    # two raters who always disagree (2 categories) -> kappa should be negative
    a = ["x", "y"] * 10
    b = ["y", "x"] * 10
    result = cohens_kappa(a, b)
    assert result < 0
    print(f"test_systematic_disagreement_gives_low_or_negative_kappa PASSED (kappa={result:.4f})")


def test_random_looking_agreement_near_zero():
    # constructed so observed agreement roughly equals chance agreement
    a = ["x", "x", "y", "y"] * 5
    b = ["x", "y", "x", "y"] * 5
    result = cohens_kappa(a, b)
    assert -0.2 < result < 0.2
    print(f"test_random_looking_agreement_near_zero PASSED (kappa={result:.4f})")


def test_symmetric_regardless_of_argument_order():
    a = ["fit_size", "price_certainty", "not_relevant", "fit_size", "other"]
    b = ["fit_size", "not_relevant", "not_relevant", "price_certainty", "other"]
    assert abs(cohens_kappa(a, b) - cohens_kappa(b, a)) < 1e-9
    print("test_symmetric_regardless_of_argument_order PASSED")


if __name__ == "__main__":
    test_perfect_agreement()
    test_empty_input_returns_none_not_error()
    test_known_reference_value()
    test_systematic_disagreement_gives_low_or_negative_kappa()
    test_random_looking_agreement_near_zero()
    test_symmetric_regardless_of_argument_order()
    print("\nAll evals/e3_cross_model_agreement.py kappa tests passed.")
