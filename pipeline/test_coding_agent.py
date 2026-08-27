"""
Unit tests for pipeline/coding_agent.py's pure parsing logic only.
No network calls, no Groq/Ollama required.

Usage:
    .venv/Scripts/python.exe pipeline/test_coding_agent.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from coding_agent import SYSTEM_PROMPT, _parse_response  # noqa: E402


def test_system_prompt_loaded_and_nonempty():
    assert isinstance(SYSTEM_PROMPT, str)
    assert len(SYSTEM_PROMPT) > 100
    assert "primary_barrier" in SYSTEM_PROMPT
    assert "fit_size" in SYSTEM_PROMPT
    print("test_system_prompt_loaded_and_nonempty PASSED")


def test_parse_response_valid_json():
    raw = '{"evidence_id": "abc", "is_relevant": true, "primary_barrier": "fit_size", "inferred_segment": null, "workaround_observed": null, "confidence_score": 0.8}'
    result = _parse_response(raw, evidence_id="abc")
    assert result is not None
    assert result["is_relevant"] is True
    assert result["primary_barrier"] == "fit_size"
    assert result["confidence_score"] == 0.8
    print("test_parse_response_valid_json PASSED")


def test_parse_response_json_wrapped_in_prose():
    raw = 'Sure, here is the classification:\n{"is_relevant": false, "primary_barrier": "not_relevant"}\nHope this helps!'
    result = _parse_response(raw, evidence_id="xyz")
    assert result is not None
    assert result["is_relevant"] is False
    assert result["primary_barrier"] == "not_relevant"
    print("test_parse_response_json_wrapped_in_prose PASSED")


def test_parse_response_invalid_barrier_falls_back_to_other():
    raw = '{"is_relevant": true, "primary_barrier": "made_up_category"}'
    result = _parse_response(raw, evidence_id="xyz")
    assert result is not None
    assert result["primary_barrier"] == "other"
    print("test_parse_response_invalid_barrier_falls_back_to_other PASSED")


def test_parse_response_missing_required_key_returns_none():
    raw = '{"primary_barrier": "fit_size"}'  # missing is_relevant
    result = _parse_response(raw, evidence_id="xyz")
    assert result is None
    print("test_parse_response_missing_required_key_returns_none PASSED")


def test_parse_response_no_json_returns_none():
    raw = "I cannot classify this."
    result = _parse_response(raw, evidence_id="xyz")
    assert result is None
    print("test_parse_response_no_json_returns_none PASSED")


def test_parse_response_malformed_json_returns_none():
    raw = '{"is_relevant": true, "primary_barrier": "fit_size"'  # truncated
    result = _parse_response(raw, evidence_id="xyz")
    assert result is None
    print("test_parse_response_malformed_json_returns_none PASSED")


def test_parse_response_defaults_evidence_id_when_missing_from_payload():
    raw = '{"is_relevant": true, "primary_barrier": "fit_size"}'
    result = _parse_response(raw, evidence_id="fallback-id")
    assert result["evidence_id"] == "fallback-id"
    print("test_parse_response_defaults_evidence_id_when_missing_from_payload PASSED")


if __name__ == "__main__":
    test_system_prompt_loaded_and_nonempty()
    test_parse_response_valid_json()
    test_parse_response_json_wrapped_in_prose()
    test_parse_response_invalid_barrier_falls_back_to_other()
    test_parse_response_missing_required_key_returns_none()
    test_parse_response_no_json_returns_none()
    test_parse_response_malformed_json_returns_none()
    test_parse_response_defaults_evidence_id_when_missing_from_payload()
    print("\nAll pipeline/coding_agent.py parsing tests passed.")
