# Wishlist → Purchase Conversion — Blueprint v2

**Brief:** Graduation Project Aug 2026 · Myntra / AJIO / Nykaa Fashion
**Deadline:** Sep 5, 2026, 3:59 PM IST · **Today:** Aug 18 · **18 days**
**Target submission:** Sep 4, morning.

> **This is the last planning pass.** The remaining risk is not insufficient architecture — it is time spent architecting instead of executing. Everything below is either a decision already made or a checklist. If you find yourself adding to this document instead of running Day 1, stop.

---

## PART 0 — HARD CONSTRAINTS

| Constraint | Consequence if broken |
|---|---|
| Solution cannot offer monetary incentives | Solution out of scope; Parts 4–7 collapse |
| ≤10 slides (brief: "10 slides max") | Non-compliant. **Resolved: maximum of ten, no title-slide exemption.** |
| Font size 14, "strictly adhered to" | Explicitly flagged in brief — assume checked |
| Fellow's name nowhere in deck | Anonymity breach |
| Discovery engine link must be **testable** | Screenshots do not satisfy this |
| MVP deployed to production, publicly interactable | Local demo does not satisfy this |
| Slide titles state the key message | Presentation criterion |
| Colour-blind safe, readable contrast | Presentation criterion |
| Hyperlinked artefacts accessible to a logged-out reader | Test in incognito |

### No-monetary-incentives, unpacked

**Ruled out:** discounts, coupons, wishlist offers, cashback, loyalty points, free-shipping giveaways, referral credit.

**Grey zone (state the interpretation on the slide if used):** notifying a user of a price drop that occurred independently; surfacing an existing platform sale; bundling toward an existing free-shipping threshold. *This is my interpretation, not a stated brief rule.*

**Clearly allowed:** fit/size confidence, styling and occasion context, social proof, return-policy clarity, stock and size scarcity information, price *transparency* and history, comparison tooling, re-encounter timing, uncertainty resolution of any kind.

**Tie-break rule:** on close evidence, prefer non-price territory — it avoids needing to defend a brief interpretation in the final week. But **do not pre-commit away from price.** If price certainty wins on evidence, build it and state the interpretation openly.

---

## PART A — DAY 1–2: VIABILITY PILOT

### A.1 Product choice

Pick primarily on **corpus size and community footprint**. Prior: Myntra (*Medium confidence — unverified*). Confirm with a raw review count on day 1.

**Do not build a "4.1× signal density" claim.** At an expected ~2% signal rate, 500 reviews yields ~10 hits with a 95% CI of roughly 0.8–3.2%. Ranking three apps on that is noise. Report density as a *source viability* figure with its confidence interval, never as a ranking headline.

### A.2 Source viability gate

Scrape **500 recent reviews per app** (1,500 total, not 3,000). Two-stage relevance filter: keyword pre-filter → cheap LLM pass.

**Estimate: 1–3% of app reviews will be wishlist-relevant. Low confidence — inference from analogous corpora, not measurement.** This gate exists to resolve it.

| Usable items from 500 (winning app) | Action |
|---|---|
| >30 | Play Store viable as primary. Scale to 3,000–5,000. |
| 10–30 | Play Store is supporting evidence only. Reddit becomes primary. |
| <10 | Play Store is background. Reallocate entirely; report the finding. |

**Reallocation targets:** Reddit (r/IndianFashionAddicts, r/TwoXIndia, r/india, r/DesiFashion, fashion-shopping threads — *verify activity before relying; I cannot confirm current subreddit status*), YouTube comments on Indian haul/try-on/"worth it?" videos, hand-curated Quora and forum threads.

**If signal is thin, that is a finding, not a failure:** public review corpora are structurally biased toward post-purchase logistics. Wishlist hesitation is *pre-purchase and silent* — it generates almost no public text. That explains why the problem is under-served and why primary research carries disproportionate weight here.

### A.3 Source-bias table (goes in the deck)

| Source | Good for | Structurally bad for | Used for |
|---|---|---|---|
| App reviews | Post-purchase friction, complaints | Silent pre-purchase behaviour | Barrier vocabulary, volume |
| Reddit | Detailed reasoning, workarounds | Population prevalence | Mechanism, hypothesis generation |
| YouTube comments | Purchase-hesitation language in the moment | Attribution, segment identity | Corroboration |
| Interviews | Depth, causality, workarounds | Prevalence (n=6) | Confirmation / contradiction |

Deck line: *"Each source is used only for the type of evidence it is structurally capable of providing."*

---

## PART B — METRIC DECOMPOSITION (Part 2)

### B.1 Metric definition

> **Wishlist→purchase conversion (30d) = users who purchase ≥1 wishlisted item within 30 days of adding it / users who added ≥1 item to wishlist in the period**

Stated choices: per **user**, not per item · window starts at **add** · removed-then-purchased counts · purchased off-platform is unobservable leakage · out-of-stock items stay in the denominator (product failure, not user failure) · **baseline unknown and unobtainable — do not invent one.**

### B.2 Decomposition

> **Conceptual multiplicative decomposition. Factors are correlated, not independent — this is an explanatory frame, not an estimator.**

```
P(purchase ≥1 wishlist item in 30d)
  ≈ Intent × Availability × Re-encounter × Resolution × Checkout
```

| Factor | Definition | Money-free levers? |
|---|---|---|
| **Intent** | Share of adds that are purchase intent vs. bookmark / inspiration / comparison-parking | Yes — intent capture at add, list structure |
| **Availability** | Item in stock, in the user's size, at revisit | Yes — stock and size alerting |
| **Price certainty** | Perceived fairness; waiting for a better price | Transparency only — **reduction blocked** |
| **Re-encounter** | User revisits or is re-surfaced within 30d | Yes — timing, context, surfacing |
| **Resolution** | Blocking uncertainty gets resolved at revisit | Yes — richest lever |
| **Checkout** | Survives cart → payment | Yes, but well-trodden |

*Price is separated from Availability — stock-out is a hard block, price hesitation is a soft one, and they respond to completely different interventions.*

**Why this earns its slide:** the no-money constraint mechanically removes most price levers, pushing the opportunity toward Intent, Re-encounter, and Resolution. That narrowing is derived, not assumed.

**Any funnel diagram carries:** `Illustrative model — no platform data access. Structure is argued; values are not measured.`

---

## PART C — HYPOTHESES + KILL CRITERIA (freeze before data)

### C.1 Hypotheses

- **H1** — Non-conversion is primarily unresolved *uncertainty*, not *forgetting*
- **H2** — A material share of adds were never purchase intent, so the denominator is structurally inflated ← *the brief explicitly asks "when do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism?" This is the highest-leverage hypothesis in the set.*
- **H3** — The dominant uncertainty differs by segment
- **H4** — Users resolve uncertainty *outside* the app and often do not return
- **H5** — Availability decay silently kills a share of high-intent saves
- **H6** — Users prefer explainable output over confident black-box output

### C.2 Output is a matrix, not a ranking

| Segment | Fit/size | Price certainty | Occasion/styling | Quality/trust | Timing | Availability decay |
|---|---|---|---|---|---|---|

Pick **one cell** and defend it. This matches the brief's own worked example and makes segment selection a visible, evidenced decision.

### C.3 Kill criteria — pre-committed, relative

The chosen opportunity must satisfy **all four**:

1. Ranks **#1 or #2** among barriers within its segment
2. Carries **≥1.5× the evidence** of the #4 barrier in that segment
3. Confirmed across **≥2 source types**, including interviews
4. Has an **observed user workaround** (proof the pain is real enough to cost effort)

*A relative rule survives a flat distribution where a fixed "<25%" threshold would kill everything. It stays pre-committed and falsifiable — no judgement call at decision time.*

Additionally abandon if: the only viable solution requires monetary incentive · deterministic-core accuracy <70% on the controlled set · users cannot articulate what the MVP output means.

**Pivot ladder:** `Uncertainty resolution → Re-encounter/timing → Intent capture at add → Availability alerting`

---

## PART D — DISCOVERY ENGINE

### D.1 Division of labour — non-negotiable

```
Collection (Python, local, once, output committed)
  → dedupe → language filter → PII scrub → length filter
  → relevance pre-filter (cheap LLM, batch 50)
  → LLM CODING ONLY (boolean/categorical, strict JSON, evidence_id)
  → JSON schema validation (reject + retry)
  → PYTHON COMPUTES ALL STATISTICS
  → human audit sample
  → findings
```

**Frozen chain:** `raw/ → clean/ → coded/ → analysis/ → deck/`. If a number changes, the *script* changes. No manual edits to outputs, ever. One authoritative stats script is the single source of every figure in the deck.

### D.2 Agents

`1 orchestrator + 2 spokes`, hub-and-spoke, spokes never talk to each other:
- **Coding Agent** — applies the frozen codebook, returns strict JSON with `evidence_id`
- **Synthesis Agent** — names clusters, drafts the segment × barrier matrix, cites evidence IDs

Dedupe, embedding, clustering, counting, statistics are **deterministic code**. If clustering: UMAP before HDBSCAN — raw high-dimensional vectors collapse to ~2 clusters regardless of corpus size.

Every risky node `onError: continueErrorOutput` → logs to `pipeline_errors` and continues. Wait nodes for rate limits. Chunk inputs >8k tokens.

### D.3 The codebook — write this before anything else

```
<code>_uncertainty = TRUE if the text explicitly expresses:
  - [condition]
  - [condition]
= FALSE if:
  - [near-miss that should not count]
  - [near-miss that should not count]
Ambiguous → flag for review, do not force a label.
```

Every code gets positive examples, negative examples, and at least two documented near-misses. Version it. **If the codebook changes mid-run, re-code from scratch and say so** — a taxonomy that drifts during analysis invalidates every downstream percentage.

### D.4 Testable link (deliverable-critical)

1. **n8n form trigger** — paste sample text, get coded output. Best fit for "can be tested."
2. Public webhook + documented curl example
3. Loom — supplementary only, **does not satisfy the deliverable alone**

**Hosting:** n8n Cloud trial is ~14 days (*Medium confidence — verify*). Started today it dies ~Sep 1, before submission. **Self-host (~$5/mo) or buy one month (~$20–24/mo), ±50%.** Do not run the trial and hope. Total project budget ~$30–60, ±50–100%.

Ship all three: live link + committed workflow JSON + Loom.

---

## PART E — EVALS

Every metric generated by a committed script; output CSVs committed.

### E1 — Coding accuracy (the spine)

Hand-label 60–100 items blind → accuracy, precision, recall, F1 per code.

**Circularity guard — this is the part that is easy to get wrong.** If you write the codebook, label the gold set, *and* write the coding prompt, you are measuring whether the model agrees with the brain that wrote its instructions.

```
1. Freeze codebook
2. Hand-label gold set          ← BEFORE the prompt exists
3. Write/tune coding prompt     ← never against the gold set
4. Run gold set once, held out
```

If you tune the prompt against the gold set at any point, that set is burned — label a fresh holdout. Report the actual F1. 0.72 honestly reported beats 0.85 fabricated.

### E2 — Quote fidelity

Exact/normalised substring match of every quoted item against the raw corpus. Auto-discard non-matches. Target 0% hallucinated quotes. ~20 lines of code — never cut this.

### E3 — Cross-model robustness *(not validation)*

Two different models code the same 200-item sample → Cohen's κ.

**Label it "cross-model agreement / robustness."** κ tells you the models agree. It does **not** tell you either is correct. E1 remains the only accuracy measure.

### E4 — Run stability

Same corpus, 3 runs → rank-order agreement of top barriers. If #1 changes between runs, the finding is not robust and you say so.

### E5 — Intra-rater reliability

Re-code 50 items blind after 48h. Solo researcher — **do not claim inter-rater reliability.** First to cut under time pressure.

### E6 — Triangulation

| Finding | Reviews | Reddit | YouTube | Interviews | Confidence |
|---|---|---|---|---|---|

Single-source findings are Low confidence and cannot become the MVP, however compelling the quote.

### E7 — Confirm/contradict

| AI hypothesis | Interview outcome | Verdict |
|---|---|---|

**At least one honest contradiction survives into the deck.** Do not sand it down.

### E8 — MVP evaluation (three distinct things, never blurred)

| Layer | Method | Answers |
|---|---|---|
| **Engineering** | 50–100 synthetic ground-truth cases | Does the implementation execute its own rules correctly? |
| **Experience** | 5–8 users, before/after confidence, task completion, time | Does it help real people? |
| **Real-world accuracy** | **Not establishable in 18 days** | Stated as a limitation, not attempted |

Plus two guardrails:

**Confidence calibration** — the most dangerous cell is high-confidence-and-wrong:

| | Correct | Wrong |
|---|---|---|
| High confidence | | ← **danger cell** |
| Medium confidence | | |
| Insufficient evidence | n/a | n/a |

**Explainability comprehension** — after using it, ask "why did the system recommend this?" Measure % who correctly identify the rationale. Far stronger than "did you like it?"

### Evidence labels — used throughout the deck

**Observed** (87 of 214 coded items) · **Validated** (5 of 6 interviewees) · **Inferred** (may contribute to) · **Tested** (moved 2.7 → 4.0 on n=8). Never blur. Never convert 5-of-6 into 83%.

---

## PART F — PRIMARY RESEARCH: TWO WAVES

**The sequencing trap:** the brief requires *"choose a target user segment and opportunity area based on your initial analysis"* → **then** interview that segment. Running all interviews up front for calendar safety breaks the mandated Business Metric → Discovery → Research → Problem chain that Part 4 asks you to show.

| | When | n | Purpose |
|---|---|---|---|
| **Wave 1** | Aug 20–23 | 2 | Exploratory. Sanity-check the codebook, surface vocabulary, de-risk the calendar. Explicitly labelled pre-analysis. |
| **Wave 2** | Aug 26–30 | 4 | Targeted at the engine-selected segment. This is the wave the deck's narrative rests on. |

**Recruiting and screening start today for both.** Screener goes out Day 1 — that costs nothing and removes the biggest calendar risk.

- Recruit **9–10** to land 6.
- **Recruit across intent types:** frequent wishlisters + occasional + wishlist-but-never-purchase. Recruiting only converters guarantees confirmation bias.
- Disclose sample composition honestly: small-N, network-recruited, geographically skewed.
- Notes are "notes synthesised," never presented as transcripts.
- The no-incentive rule applies to the *solution*, not recruitment — but prefer network recruitment anyway; vouchers bias toward the incentive-motivated. Disclose if you compensate.
- Cover the brief's eight prompts verbatim. **The workaround question is the most valuable input to MVP design** — Part 4 requires existing workarounds, and kill criterion #4 depends on it.

---

## PART G — MVP

### G.1 Architecture

```
Structured user input
  → DETERMINISTIC CORE          ← decides
  → Evidence retrieval (grounded in research corpus)
  → LLM EXPLANATION LAYER       ← narrates
  → Output + visible reasoning + confidence state
```

**The LLM explains; it never decides.** This shape holds regardless of which problem wins.

### G.2 Three output states, always

```
High confidence     — [output] + reasons + what supports it
Medium confidence   — [output] + reasons + what is missing
Insufficient evidence — "I can't confidently answer because [X] is unavailable."
```

The ability to say *I don't know* is a product feature and an evaluation feature. Never force an answer.

### G.3 Ruled out

Selfie → body-type → fit inference (unevaluable, privacy-problematic, overclaiming). "Body type" as a model input (vague, bias-introducing). Any output stated with unearned confidence.

### G.4 Requirements regardless of chosen problem

A **baseline** it must beat (current in-app experience or manual-effort equivalent) · **50–100 synthetic ground-truth cases** · **5–8 person usability test** · **traceability** — every output has a "why am I seeing this?" citing the research finding it addresses, closing the loop between engine and MVP · **explicit labelling of simulated data in the UI**, not just the deck.

### G.5 Stack

Vite + React → Vercel. Supabase if persistence needed. Serverless proxy for any LLM call — **never expose a key client-side.**

Not Streamlit Community Cloud — inactivity sleep means the judge's click may hit a spinner.

Reliability priority order (**do not invert this**):
```
1. Stable production deployment
2. No client-side keys
3. Graceful API failure handling
4. Static demo GIF fallback in README
5. Uptime monitoring    ← last, and cheap or skipped
```
If you spend three hours building monitoring instead of improving the MVP, you have violated your own anti-waste rule.

---

## PART H — THE DECK

**Correction to v1: you have one free slot.** The brief lists 8 content bullets plus the mandated engine 1-slider = 9. Metric definition and decomposition belong on one slide. The tenth is discretionary — **spend it on evidence quality.**

| # | Slide states the key message | Content |
|---|---|---|
| 1 | The metric, defined, and what it decomposes into | Definition + Intent × Availability × Re-encounter × Resolution × Checkout + which factors the no-money constraint blocks |
| 2 | How the discovery engine works | Mandated 1-slider: architecture, **testable link**, corpus, LLM-codes/Python-counts |
| 3 | What the engine found — segment × barrier matrix | Findings, evidence counts, source-bias note |
| 4 | **How I know the AI's findings are real** | ← the discretionary slide. F1, κ (labelled robustness), quote fidelity, run stability, source-bias table. Hyperlink to full results. |
| 5 | What 6 interviews confirmed, reframed, and killed | Confirm/contradict matrix; two-wave design stated; n and skew stated |
| 6 | The problem: [segment] cannot [outcome] because [root cause] | Segment, outcome, root cause, workarounds, user value, business value |
| 7 | Why this solution shape, given the constraints | Rationale, alternatives rejected, why no monetary incentive is needed |
| 8 | Live MVP: [what it does] | Screenshots, link, simulated-data labelling, traceability to slide 3 |
| 9 | Success metrics: north star, leading, guardrail | Definitions + rationale. Guardrail must include false-confidence. |
| 10 | Risks and mitigation | Include "the finding itself is wrong" and what would detect it |

**Evidence strip format** (readable at 14pt, one line):
> **Evidence quality:** n=214 · F1=0.84 · κ=0.78 · quote hallucination 0% · 4 sources → *[link to full eval report]*

### Compliance checklist

- [ ] ≤10 slides
- [ ] Every text element 14pt — **verify by inspection.** Build in Google Slides or PowerPoint. Gamma auto-sizes and makes 14pt unverifiable (*Medium confidence*). 14pt is small — use fewer words, not smaller text.
- [ ] Titles are key messages, not section labels
- [ ] No red/green-only encoding; pair colour with icon, pattern, or label
- [ ] Contrast checked on coloured backgrounds
- [ ] `grep -ri "FELLOW_NAME" .` across repo and deck source
- [ ] PDF **Author metadata** stripped (this is a real leak vector), text layer grepped
- [ ] Loom display name checked; repo on a project-specific account
- [ ] Every hyperlink opened in incognito
- [ ] Every number traceable to a committed script
- [ ] Sample sizes visible wherever a claim is made

---

## PART I — TIMELINE + DAILY GATES

| Dates | Work | Gate |
|---|---|---|
| **Aug 18–20** | Source viability pilot (500×3). Product chosen. Scrapers run, raw committed. **Codebook written and frozen. Gold set hand-labelled.** Metric definition + decomposition. Hypotheses + kill criteria frozen. **Screener out to 9–10 candidates.** Repo scaffold + `hypotheses.md`, `experiment_manifest.md`, `FAILURES.md`. | **Aug 20: is there enough usable discovery data?** |
| **Aug 21–24** | Clean/dedupe/PII. Coding prompt written (never tuned on gold set). Coding run. Stats script — single source of truth. First matrix. n8n built, hosting resolved. **Wave 1 interviews (2).** | **Aug 24: enough validated evidence to choose an opportunity?** |
| **Aug 25–27** | E1–E4 running. Triangulation. Kill criteria checked. **Segment + opportunity chosen and defended.** | **Aug 27: can the problem be stated in one sentence?** |
| **Aug 26–30** | **Wave 2 interviews (4)**, targeted at chosen segment. MVP built and deployed. Baseline implemented. | **Aug 30: is a working MVP deployed?** |
| **Sep 1–2** | E8: synthetic set + usability test (5–8). Calibration matrix. README case study. Loom. | **Sep 2: does the MVP show measurable improvement?** |
| **Sep 3–4** | Deck + compliance sweep. Links incognito-tested. Metadata stripped. **Submit Sep 4 AM.** | **Sep 3: is the deck compliant?** |

**Any "no" at a gate triggers the cut order immediately.** This prevents the classic failure: everything 70% complete, nothing demo-ready.

### Cut order (pre-committed)

1. Survey — not required by the brief
2. YouTube as a source
3. E5 (intra-rater), then E4 (stability)
4. Insights dashboard → static charts in repo
5. Usability test down to 5 participants
6. Wave 2 down to 3 interviews (total 5 — still meets the brief's 5–6)

**Never cut:** testable workflow link · deployed MVP link · 5 interviews minimum · E1 and E2 · deck compliance.

---

## PART J — ENGINEERING JOURNAL

Two files, updated as you go, not reconstructed at the end.

**`experiment_manifest.md`** — one row per experiment:
```
ID · Hypothesis · Dataset · Method · Expected · Actual · Decision · Timestamp
```

**`FAILURES.md`** — one entry per failure:
```
Date · Attempt · Observed error · Root cause · Fix · Lesson · Do-not-repeat rule
```

This is the answer to *"what technical challenges did you face?"* — and it is worthless if written retrospectively.

---

## PART K — RISK REGISTER

| Risk | Likelihood | Mitigation |
|---|---|---|
| Wishlist signal near-absent in app reviews | **High** | Aug 20 gate; pre-planned reallocation; framed as a finding |
| Fewer than 5 interviews materialise | **High** | Screener out Day 1; two-wave design; recruit 9–10; cut order allows n=5 |
| E1 circularity invalidates the accuracy claim | Medium | Gold set labelled before prompt exists, held out, never tuned against |
| Finding contradicts the eventual MVP | Medium | Kill criteria + pivot ladder pre-committed; documented pivot is a strength |
| Research points to price → constraint pressure | Medium | Pre-planned: solve price *certainty*, not reduction; state interpretation on slide |
| n8n link dead during review | High if on trial | Pay one month or self-host; committed JSON + Loom |
| MVP cold start when judge clicks | Medium | Vercel not Streamlit Cloud; static GIF fallback |
| Deck breaks 10 slides or 14pt | Medium | Compliance checklist; build where font is inspectable |
| Name leaks via repo, Loom, or PDF metadata | Medium | Project account; strip Author field; grep; incognito test |
| LLM-generated percentages leak into deck | Low if disciplined | Python computes all statistics; frozen chain; no manual edits |
| Scraper breaks or source blocks | Medium | Scrape days 1–3, commit raw, never depend on live scraping |
| Overclaiming from n=6 | Medium | Evidence labels; counts not percentages |
| **Over-planning instead of executing** | **High** | This document is closed. Next action is Day 1. |

---

## Definition of success

> The project succeeds if it can show, with reproducible evidence, **why one opportunity survived competing hypotheses**, and then demonstrate that the resulting MVP improves a measurable user outcome **without creating unacceptable false confidence.**

Not "we found the right answer and built a thing."

---

## Confidence summary

- **High:** brief constraints and deliverables; slide arithmetic (9 mandated + 1 free); LLM-codes/Python-counts discipline; deterministic-core MVP shape; E1 circularity risk; two-wave interview sequencing requirement
- **Medium:** Myntra as highest-corpus product; n8n trial length; Gamma's inability to guarantee 14pt; named subreddits being active
- **Low:** the 1–3% signal-density estimate — inference, not measurement; the Aug 20 gate exists to resolve it
- **Unverifiable:** grading rubric weights; whether linked-artefact name leaks are penalised
- **Costs:** estimates with ±50–100% ranges, not quotes
