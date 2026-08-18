# Implementation Blueprint — Wishlist Conversion Project

This document is the build-level companion to `wishlist-conversion-blueprint-v2.md` (the strategy blueprint). That document defines *what* and *why*. This one defines *how to build it*, in the order Claude Code should build it.

**Do not re-decide strategy while implementing.** If Claude Code hits a decision already made in v2 (kill criteria, codebook categories, evidence labels, metric definition), it should read v2 and follow it, not re-derive it.

---

## 1. Repo structure

```
wishlist-conversion/
├── README.md                    # Case study — written last, updated throughout
├── docs/
│   ├── blueprint/                # This file + v2 + design spec, read-only reference
│   ├── architecture.md           # Mermaid diagram, written once pipeline is stable
│   ├── hypotheses.md             # H1–H6, frozen Day 1
│   ├── codebook.md               # Frozen taxonomy, versioned (v1, v2...)
│   ├── experiment_manifest.md    # One row per experiment — updated live, not retrospectively
│   ├── FAILURES.md               # One entry per failure — updated live
│   └── decisions/                # Short ADRs: "why 500/app not 1000", "why gpt-oss not llama-3.3"
├── scrapers/
│   ├── playstore.py
│   ├── appstore.py
│   └── reddit.py
├── pipeline/
│   ├── clean.py                  # dedupe, language filter, PII scrub, length filter
│   ├── embed.py                  # sentence-transformers, local, free
│   ├── cluster.py                # UMAP → HDBSCAN
│   └── stats.py                  # THE single authoritative source for every number in the deck
├── agents/
│   ├── coding_agent_prompt.md    # Frozen system prompt, matches codebook.md exactly
│   ├── synthesis_agent_prompt.md
│   └── run_synthesis.py          # Batch call to name/describe clusters (low volume, run locally)
├── workflows/
│   └── discovery-engine-webhook.json   # The public testable n8n link — deliverable-critical
├── evals/
│   ├── e1_coding_accuracy.py
│   ├── e2_quote_fidelity.py
│   ├── e3_cross_model_agreement.py
│   ├── e4_run_stability.py
│   ├── e5_intra_rater.py
│   ├── gold_set/                 # Hand-labelled, frozen before prompt is tuned — see §5
│   └── results/                  # Committed CSVs — every deck number traces here
├── mvp/                          # Vite + React app — see 01_MVP_DESIGN_SPEC.md
│   ├── src/
│   ├── api/                      # Serverless proxy — no client-side keys, ever
│   └── mock-data/                # Simulated personas, garment measurements
├── data/
│   ├── raw/                      # Committed, disaster insurance
│   └── processed/
├── survey/
│   └── questionnaire.md          # See 04_SURVEY_QUESTIONNAIRE.md
├── .env.example
└── LICENSE
```

---

## 2. Tech stack — final decisions

| Layer | Choice | Why |
|---|---|---|
| Scraping | Python, local, run once | Never depend on live scraping again |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2`, local | Free, fast, no API cost, already proven in prior work |
| Clustering | UMAP → HDBSCAN | Raw high-dim vectors collapse to ~2 clusters without UMAP first |
| Classification LLM | Groq, `openai/gpt-oss-20b` | Cheap, fast, current (see §3) |
| Escalation/synthesis LLM | Groq, `openai/gpt-oss-120b` | Higher quality, used sparingly |
| Cross-model check | Local Ollama, `hermes3:8b` | Zero cost, architecturally distinct from the Groq-hosted model — a genuine second opinion, not two variants of the same lineage |
| Orchestration | n8n (self-hosted or 1 month paid) | Testable public link deliverable |
| Vector/relational store | Supabase (Postgres + pgvector) | Free tier sufficient at this scale |
| MVP frontend | Vite + React → Vercel | No cold-start sleep, proven stack |
| MVP backend | Vercel serverless functions | Proxies LLM calls, keeps keys server-side |
| Survey | Google Forms | Free, simple export |

---

## 3. Model routing — verified Aug 19, 2026

**Do not use `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.** Groq retired both on August 16, 2026. If you see either string anywhere (including in older reference material or cached examples), replace it.

Current routing:

```
Classification (high volume, cheap, deterministic temperature=0)
  → Groq: openai/gpt-oss-20b

Retry / escalation (validation failed on first pass)
  → Groq: openai/gpt-oss-120b
  (escalating to the larger model on retry, rather than blindly repeating
  the same call, is a defensible design choice — worth a line in FAILURES.md
  if it materially improves the retry success rate)

Synthesis Agent (cluster naming — low volume, ~10-30 calls total)
  → Groq: openai/gpt-oss-120b

Cross-model robustness check (E3 — must be a genuinely different model)
  → Local: Ollama, hermes3:8b  (pull with `ollama pull hermes3:8b`)
  Fallback if unavailable: Groq, qwen/qwen3.6-27b (different lab/lineage
  from the OpenAI gpt-oss family, though currently served as a preview
  model on Groq — verify availability before committing to it)
```

**Why local Hermes for E3, not a second paid API:** two models from Groq's `openai/gpt-oss-*` family share training lineage — agreement between them says less about ground truth than agreement between genuinely different architectures. Hermes 3 (Nous Research, Llama-based but independently fine-tuned) run locally costs nothing and is a more defensible "second rater" for the methodology section.

**Verify before building:** model names and deprecation timelines move fast on Groq specifically (three deprecation waves in 2026 already). Check `console.groq.com/docs/models` and `console.groq.com/docs/deprecations` before the coding run, not just before writing this document.

---

## 4. Rate limits and token budget

Groq's free tier is commonly reported around 30,000 tokens/minute with a daily request cap (verify current numbers at `console.groq.com/settings/limits` — this changes without much notice).

Strategies to stay under budget:

1. **Batch, don't stream single reviews.** For the full-corpus coding run (not the public demo webhook), batch 20–30 short reviews into a single classification call with an array-in/array-out schema, rather than one call per review. Cuts request count by 20–30×.
2. **Cache by content hash.** Many reviews contain near-duplicate boilerplate ("good product, fast delivery"). Hash normalized text before calling the API; skip the call if the hash was already classified. Log cache hits — this is a legitimate efficiency metric for the README.
3. **Wait nodes between batches.** 2-second gaps in the n8n batch workflow, as in the original blueprint.
4. **Use Ollama for development iteration.** While tuning the codebook and testing the pipeline end-to-end, run classification against local `hermes3:8b` or `qwen2.5:7b-instruct` instead of burning Groq quota on runs you'll throw away. Switch to Groq only for the frozen, final run.
5. **Reserve `gpt-oss-120b` for synthesis and retries only.** The classification volume (hundreds to low thousands of items) should run almost entirely on `gpt-oss-20b`.

---

## 5. Phase plan — mapped to v2's timeline gates

Build in this order. Do not start a phase before the prior gate passes (see v2 Part I).

### Phase 0 — Scaffold (Aug 18–19)
- Repo structure above
- `.env.example` with `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `docs/hypotheses.md` — H1–H6 from v2, frozen
- `docs/codebook.md` — v1, frozen, matches the schema embedded in `agents/coding_agent_prompt.md`

### Phase 1 — Viability pilot (Aug 18–20, gate: Aug 20)
- `scrapers/playstore.py` — 500 reviews × 3 apps
- `pipeline/clean.py` run on all three
- Relevance pre-filter using the coding agent (provisional codebook) at low volume — this IS the viability gate measurement
- Decision logged in `docs/decisions/product-and-source-choice.md`

### Phase 2 — Gold set (Aug 20–21, before Phase 3)
- **This must happen before the coding prompt is finalized — see v2 Part E, E1 circularity guard.**
- Hand-label 60–100 items blind into `evals/gold_set/`
- Only after this is frozen: finalize `agents/coding_agent_prompt.md`

### Phase 3 — Discovery engine (Aug 21–24, gate: Aug 24)
- `pipeline/embed.py`, `pipeline/cluster.py`
- Batch coding run against the full viable corpus
- `pipeline/stats.py` — single source of truth for all percentages
- `workflows/discovery-engine-webhook.json` deployed to n8n, tested publicly
- `agents/run_synthesis.py` — names clusters, produces the segment × barrier matrix

### Phase 4 — Evals (parallel with Phase 3, must finish by Aug 24 gate)
- `evals/e1_coding_accuracy.py` against the frozen gold set
- `evals/e2_quote_fidelity.py`
- `evals/e3_cross_model_agreement.py` (Groq gpt-oss-20b vs. local hermes3:8b)
- `evals/e4_run_stability.py` if time allows (first item cut under pressure per v2)
- `evals/e5_intra_rater.py` if time allows (first item cut)

### Phase 5 — Segment/opportunity selection (Aug 25–27, gate: Aug 27)
- Apply the relative kill criteria from v2 §C.3 against the matrix
- `docs/decisions/opportunity-selection.md` — states which cell won and why, with the evidence numbers

### Phase 6 — MVP (Aug 26–30, gate: Aug 30)
- Build per `01_MVP_DESIGN_SPEC.md` — **read that file before writing any component**
- Deterministic core first, LLM narration layer second, never the reverse
- Deploy to Vercel early (Aug 27–28) even with placeholder data, so deployment risk is retired before the real content is ready

### Phase 7 — MVP eval + polish (Sep 1–2, gate: Sep 2)
- Synthetic ground-truth test set (50–100 cases)
- Usability test (5–8 people)
- Confidence-calibration matrix

### Phase 8 — Deck + compliance (Sep 3–4)
- Build in Google Slides or PowerPoint, not Gamma (font-size verifiability — see v2)
- Run the full compliance checklist from v2 Part H before export

---

## 6. GitHub / Hugging Face resources worth using directly

| Need | Resource | Note |
|---|---|---|
| Play Store scraping | `JoMingyu/google-play-scraper` (PyPI: `google-play-scraper`) | No auth needed, actively maintained historically — verify it still works day 1, that's why it's scheduled first |
| Reddit | `praw` (PyPI) | Official API wrapper, free tier |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` (Hugging Face) | Local, ~80MB, fast on CPU |
| Alt/backup embeddings | `BAAI/bge-small-en-v1.5` (Hugging Face) | Slightly stronger on retrieval benchmarks if MiniLM underperforms on Hinglish text — worth a quick comparison during Phase 3 |
| Local classification model | `hermes3:8b` via Ollama | `ollama pull hermes3:8b` — confirmed available in the Ollama library |
| Local tool-calling alternative | `qwen3:14b` via Ollama | Community-reported as the more reliable tool-caller of the two if `hermes3` produces malformed JSON often; larger, needs more VRAM |
| n8n hosting | `n8n-io/n8n` self-host on Railway/Render | ~$5/mo, avoids the 14-day Cloud trial expiry risk |
| Clustering | `umap-learn` + `hdbscan` (PyPI) | Standard pairing, already proven in prior project work |

On "maps" — if this meant architecture/roadmap diagrams: use Mermaid (renders directly in GitHub READMEs, zero setup) for `docs/architecture.md`, which is what's already planned. If it meant literal geographic mapping (e.g., for Pune interview logistics), that's out of scope for the MVP and not needed for any deliverable — flag if this was meant differently and I'll size the actual need.

---

## 7. What "clean execution" means operationally

- Every script in `pipeline/` and `evals/` runs from a single `make` target or documented command — no manual multi-step processes that only you remember
- `docs/experiment_manifest.md` and `docs/FAILURES.md` are updated the day something happens, not reconstructed before submission
- Commits are small and conventional (`feat:`, `fix:`, `data:`, `eval:`) — the history itself is evidence of process, per v2's repo hygiene note
- No manual edits to any file under `evals/results/` or `data/processed/` — if a number is wrong, fix the script and re-run
