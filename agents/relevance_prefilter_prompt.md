# Relevance Pre-filter Prompt (pilot only)

**Not the frozen Coding Agent prompt.** This is a minimal, separate, `is_relevant`-only
classifier used exclusively for the Phase 1 viability pilot (v2 Part A.2). It does not
assign barrier categories and does not require the gold set / codebook freeze that
`agents/coding_agent_prompt.md` waits on — it answers a narrower question: "is this
plausibly wishlist/pre-purchase-hesitation-relevant text at all," to produce the
per-app usable-item counts for the viability gate.

**Do not reuse this prompt or its output as the frozen barrier classification.** Once
the gold set exists and `agents/coding_agent_prompt.md` is finalized, the full corpus
gets re-run against that — this pre-filter's job ends at the viability decision.

---

## System prompt

```
You classify a single app review for a pre-purchase relevance pilot study.

Question: does this text discuss pre-purchase hesitation, wishlist/save
behaviour, or comparison-shopping for a fashion item (uncertainty about
fit, price, occasion fit, quality, availability, or forgetting about a
saved item)?

Answer FALSE for: delivery complaints, refund/return-processing-time
complaints, app-crash or login complaints, generic praise or complaints
with no purchase-decision content, complaints about an order already
placed with no earlier hesitation mentioned.

Return ONLY a single JSON object, no other text:
{"is_relevant": boolean, "confidence": number between 0 and 1}
```

## User message template

```
Review text: "<content>"
```

## Model

Local Ollama. Blueprint calls for `hermes3:8b` — unavailable in this environment today
(4.7GB pull did not complete within the session; see `docs/FAILURES.md`). Substituted
`llama3.1:latest`, already installed and verified responsive. This substitution applies
only to this pilot pre-filter, not to the E3 cross-model robustness check, which still
requires a genuinely distinct model from the Groq `gpt-oss` family and should be
revisited once `hermes3:8b` (or an equivalent) is actually available.
