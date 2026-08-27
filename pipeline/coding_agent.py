"""
Implements the frozen Coding Agent classifier (agents/coding_agent_prompt.md).

Single responsibility: classify one piece of text against the frozen
codebook. No stats, no aggregation, no percentages -- see pipeline/stats.py
for that ("LLM classifies, Python counts" -- docs/blueprints/
02_AGENT_ORCHESTRATION.md).

The system prompt is loaded directly from agents/coding_agent_prompt.md's
"System prompt" code block at import time, rather than duplicated here as
a string constant -- this is the single source of truth the blueprint
requires ("this prompt must be updated to match exactly if the codebook
changes"). If that file's prompt block is ever edited, this module picks
it up automatically; nothing here needs a matching edit.

Two backends:
- classify_groq(): primary, per the frozen spec (openai/gpt-oss-20b via
  Groq, one retry escalating to openai/gpt-oss-120b, 15s timeout).
  Requires GROQ_API_KEY (read from .env, falls back to the environment).
- classify_ollama(): local substitute for E3 cross-model robustness --
  hermes3:8b (the blueprint's specified Model B) has never successfully
  pulled in this environment, see docs/FAILURES.md 2026-08-19. Pass any
  locally available Ollama model.

Never raises -- both classify_groq() and classify_ollama() always return
a result dict, even on total failure, so one bad item can't crash a
multi-hour run (same discipline as pipeline/relevance_prefilter.py).
"""

import json
import os
import re
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
PROMPT_PATH = ROOT / "agents" / "coding_agent_prompt.md"
ENV_PATH = ROOT / ".env"

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
OLLAMA_URL = "http://localhost:11434/api/generate"

PRIMARY_MODEL = "openai/gpt-oss-20b"
RETRY_MODEL = "openai/gpt-oss-120b"
GROQ_TIMEOUT_SECONDS = 15
OLLAMA_TIMEOUT_SECONDS = 60

VALID_BARRIERS = {
    "fit_size", "price_certainty", "occasion_styling", "quality_trust",
    "availability_decay", "timing_forgetting", "bookmark_not_intent",
    "other", "not_relevant",
}

JSON_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)


def _load_system_prompt() -> str:
    text = PROMPT_PATH.read_text(encoding="utf-8")
    match = re.search(r"## System prompt.*?```\n(.*?)```", text, re.DOTALL)
    if not match:
        raise RuntimeError(f"could not extract the system prompt block from {PROMPT_PATH}")
    return match.group(1).strip()


SYSTEM_PROMPT = _load_system_prompt()


def _load_groq_api_key() -> str:
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            if line.startswith("GROQ_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("GROQ_API_KEY", "")


def _empty_result(evidence_id: str | None, error: str) -> dict:
    return {
        "evidence_id": evidence_id,
        "is_relevant": None,
        "primary_barrier": None,
        "inferred_segment": None,
        "workaround_observed": None,
        "confidence_score": None,
        "error": error,
    }


def _parse_response(raw: str, evidence_id: str) -> dict | None:
    """Returns None (not a result dict) if the response can't be parsed --
    caller decides what to do (retry, escalate, or give up)."""
    match = JSON_OBJECT_RE.search(raw)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    if "is_relevant" not in parsed or "primary_barrier" not in parsed:
        return None

    barrier = parsed.get("primary_barrier")
    if barrier not in VALID_BARRIERS:
        barrier = "other"

    return {
        "evidence_id": parsed.get("evidence_id", evidence_id),
        "is_relevant": bool(parsed["is_relevant"]),
        "primary_barrier": barrier,
        "inferred_segment": parsed.get("inferred_segment"),
        "workaround_observed": parsed.get("workaround_observed"),
        "confidence_score": parsed.get("confidence_score"),
    }


def classify_groq(text: str, evidence_id: str, timeout: int = GROQ_TIMEOUT_SECONDS) -> dict:
    """Never raises. One attempt on PRIMARY_MODEL, one retry escalating to
    RETRY_MODEL on timeout/connection error/parse failure."""
    api_key = _load_groq_api_key()
    if not api_key:
        return _empty_result(evidence_id, "no_groq_api_key")

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    user_message = f'evidence_id: "{evidence_id}"\nText: "{text}"'

    last_error = "unknown"
    for attempt, model in enumerate([PRIMARY_MODEL, RETRY_MODEL]):
        payload = {
            "model": model,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        }
        # 429 (rate limit) gets its own retry-with-backoff on the SAME model,
        # rather than immediately burning the one model-escalation retry --
        # a rate limit says nothing about model quality.
        for rate_limit_attempt in range(3):
            try:
                resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=timeout)
                if resp.status_code == 429:
                    last_error = "HTTPError: 429 rate limited"
                    time.sleep(2 * (rate_limit_attempt + 1))
                    continue
                resp.raise_for_status()
                raw = resp.json()["choices"][0]["message"]["content"]
                result = _parse_response(raw, evidence_id)
                if result is not None:
                    result["model_used"] = model
                    return result
                last_error = "parse_failed"
                break
            except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
                last_error = f"{type(e).__name__}: {e}"
                break
            except requests.exceptions.HTTPError as e:
                last_error = f"HTTPError: {e}"
                break
        if attempt == 0:
            time.sleep(1)

    return _empty_result(evidence_id, f"gave_up_after_retry: {last_error}")


def classify_ollama(text: str, evidence_id: str, model: str = "llama3.1:latest", timeout: int = OLLAMA_TIMEOUT_SECONDS) -> dict:
    """Local substitute backend for E3 cross-model robustness. Never raises."""
    prompt = f'{SYSTEM_PROMPT}\n\nevidence_id: "{evidence_id}"\nText: "{text}"'
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
        resp.raise_for_status()
    except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
        return _empty_result(evidence_id, f"{type(e).__name__}: {e}")

    raw = resp.json().get("response", "")
    result = _parse_response(raw, evidence_id)
    if result is None:
        return _empty_result(evidence_id, "parse_failed")
    result["model_used"] = model
    return result
