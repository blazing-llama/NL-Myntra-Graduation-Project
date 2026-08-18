# Agent Orchestration Blueprint

## Architecture decision: this project does not need a hub LLM agent

This is worth stating plainly, because it's the same mistake the earlier Blinkit project (referenced in memory) had to walk back from: **"8 agents violates orchestration best practice... agents only where judgment is required."**

This project has exactly two places where an LLM needs to exercise judgment:

1. **Classify a piece of text against a frozen codebook** — this is the Coding Agent
2. **Name and describe a cluster of already-grouped text using its evidence** — this is the Synthesis Agent

Neither of these needs a ReAct-style hub agent that reasons about which tool to call next. There is no tool selection happening — the *workflow's branching logic* (the n8n IF nodes, the retry structure) **is** the orchestrator. Dressing that up as an "AI Agent" node with a system prompt like "you are the central orchestrator, decide what to delegate" would add latency, cost, and a hallucination surface for zero benefit, per the same reasoning that killed the 8-agent design last time.

So: **hub-and-spoke as a topology, yes. Hub-and-spoke as an LLM-reasoning-hub, no.** The hub is deterministic code (n8n branching + Python scripts). The spokes are two narrow, single-purpose classification/naming calls.

This also satisfies the composition-over-capability and visible-data-flows principles directly: each call has ≤1 responsibility, a strict JSON contract, and every input/output is logged rather than passed through implicit shared state.

---

## Agent 1: Coding Agent

**Single responsibility:** classify one piece of text against the frozen codebook. Nothing else — no summarization, no opinion, no reasoning about the broader project.

**Model:** `openai/gpt-oss-20b` via Groq, temperature 0, retry escalates to `openai/gpt-oss-120b`.

**Frozen system prompt** (must match `docs/codebook.md` exactly — if the codebook changes, this changes, and every previously-coded item must be re-run):

```
You are the Coding Agent for a wishlist-to-purchase conversion research
project. You classify short user-generated text (app review, Reddit
comment, or interview excerpt) about online fashion shopping. Apply ONLY
the codebook below. Do not infer beyond what is explicitly stated.

Return ONLY a single JSON object matching this exact schema, no other text:

{
  "evidence_id": string,
  "is_relevant": boolean,
  "primary_barrier": one of [
    "fit_size", "price_certainty", "occasion_styling", "quality_trust",
    "availability_decay", "timing_forgetting", "bookmark_not_intent",
    "other", "not_relevant"
  ],
  "inferred_segment": string or null,
  "workaround_observed": string or null,
  "confidence_score": number between 0 and 1
}

CODEBOOK (provisional — freeze the final version in docs/codebook.md
before the production coding run; this prompt must be updated to match
exactly if the codebook changes):

fit_size = TRUE only if the text explicitly expresses uncertainty about
how a garment will fit or what size to order. Do NOT use for general
appearance comments, or for post-purchase return complaints with no
size-uncertainty language.

price_certainty = TRUE only if the text expresses hesitation tied to
whether the price is fair, or whether to wait for it to drop. Do NOT use
for a simple statement that something is expensive with no hesitation
framing attached.

occasion_styling = TRUE if the text expresses uncertainty about whether
an item suits an occasion, or how to style/wear it.

quality_trust = TRUE if the text expresses doubt about material quality,
brand trust, or whether the product will match its listing.

availability_decay = TRUE if the text describes an item going out of
stock, out of size, or a price changing before a decision was made.

timing_forgetting = TRUE if the text describes simply forgetting about
a saved item, with no specific uncertainty named.

bookmark_not_intent = TRUE if the text indicates the save was for
inspiration, styling ideas, or later browsing rather than a near-term
purchase plan.

is_relevant = TRUE only if the text discusses pre-purchase hesitation,
wishlist/save behaviour, or comparison-shopping. Delivery complaints,
refund-processing-time complaints, and app-crash complaints with no
purchase-decision content are is_relevant = FALSE.

If uncertain, set is_relevant = TRUE, primary_barrier = "other", and
confidence_score below 0.5 rather than forcing a category.
```

**What this agent must never do:** compute a percentage, compare across reviews, or make claims about prevalence. It labels one item. Python counts.

---

## Agent 2: Synthesis Agent

**Single responsibility:** given a cluster of already-grouped, already-coded items (grouping done deterministically by UMAP+HDBSCAN, not by this agent), produce a short name and description for the cluster, citing evidence IDs. Low volume — one call per cluster, likely 10–30 calls total for the whole project.

**Model:** `openai/gpt-oss-120b` via Groq — quality matters more than speed here, and volume is low enough that cost is a non-issue.

**System prompt:**

```
You are the Synthesis Agent. You receive a cluster of coded text
excerpts that a deterministic clustering algorithm has already grouped
together — you did not do the grouping and must not second-guess it.

Your job: name the cluster (a short phrase, not a sentence) and write a
2-3 sentence description of what unites these excerpts, citing at least
3 of the provided evidence_ids by number.

Do NOT invent a percentage, a prevalence claim, or a comparison to other
clusters. Do NOT soften or expand the cluster's scope based on your own
judgment of what "should" be included — describe only what is present
in the excerpts you were given.

Return ONLY this JSON object, no other text:
{
  "cluster_name": string,
  "description": string,
  "cited_evidence_ids": [string, ...]
}
```

**Run pattern:** this does not need to run inside n8n — it's low-volume enough to call directly from a Python script (`agents/run_synthesis.py`) after `pipeline/cluster.py` produces the clusters. Fewer moving parts than round-tripping through a webhook for something that runs 10–30 times total.

```python
# agents/run_synthesis.py — sketch, not final
import os, json, requests

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
SYSTEM_PROMPT = open("agents/synthesis_agent_prompt.md").read()

def synthesize_cluster(cluster_items: list[dict]) -> dict:
    payload = {
        "model": "openai/gpt-oss-120b",
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(cluster_items)},
        ],
    }
    headers = {"Authorization": f"Bearer {os.environ['GROQ_API_KEY']}"}
    resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=20)
    resp.raise_for_status()
    return json.loads(resp.json()["choices"][0]["message"]["content"])
```

---

## Loop and cost prevention

- **No agent can call another agent.** The Coding Agent's output is consumed by Python (`stats.py`), never fed back into another LLM call except the retry escalation, which is a fixed one-step retry, not a loop.
- **Hard timeout** on every Groq HTTP call: 15 seconds.
- **Max one retry**, with model escalation (`gpt-oss-20b` → `gpt-oss-120b`), not indefinite retrying. After the retry fails, the item is logged as `insufficient_evidence` and the pipeline moves on — it does not block the batch.
- **Content-hash caching** before any classification call (see `00_IMPLEMENTATION_BLUEPRINT.md` §4) — this is the biggest practical lever against rate limits, since fashion app reviews contain heavy boilerplate.

---

## Cross-model check (E3) wiring

Run the *same* frozen Coding Agent prompt against two different models on a 200-item sample:

```
Model A: openai/gpt-oss-20b   (Groq, hosted)
Model B: hermes3:8b           (Ollama, local)
```

Compute Cohen's κ in `evals/e3_cross_model_agreement.py`. Label the result "cross-model agreement / robustness" in the deck, never "validation" — agreement between two models tells you they agree, not that either is correct. E1 (hand-labelled gold set) remains the only accuracy measure.
