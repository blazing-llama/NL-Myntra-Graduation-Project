# Experiment Manifest

One row per experiment. Updated the day it happens — not reconstructed at the end.

| ID | Hypothesis | Dataset | Method | Expected | Actual | Decision | Timestamp |
|---|---|---|---|---|---|---|---|
| EXP-001 | v2 A.2 source viability gate | 1,500 Play Store reviews (500 each: Myntra, AJIO, Nykaa Fashion), cleaned to 248/185/180 usable | `pipeline/relevance_prefilter.py`, minimal is_relevant-only prompt, `llama3.1:latest` via local Ollama (substituted for `hermes3:8b`, see FAILURES.md) | 1–3% relevant rate per v2's pre-registered estimate (~5–15 relevant per app from 500) | 2/248 (0.8%) Myntra, 2/185 (1.1%) AJIO, 1/180 (0.6%) Nykaa — all below even the low end of the expected range | All three `<10` on the gate table → Play Store downgraded to background/corroboration for all apps; reallocate primary discovery to Reddit/YouTube/Quora. See `docs/decisions/product-and-source-choice.md` | 2026-08-19 |
