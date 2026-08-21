# Decision: Reddit Subreddit Selection (Phase 1 reallocation)

**Date:** 2026-08-19
**Context:** Play Store reviews landed in the `<10` viability tier for all three apps (see `docs/decisions/product-and-source-choice.md`). Per v2 Part A.2's pre-planned reallocation, primary discovery moves to Reddit/YouTube/Quora. This document covers the Reddit subreddit selection step.

## Verification method

PRAW-based automated verification was attempted first and abandoned — Reddit blocks unauthenticated JSON access as of this date (`www.reddit.com/.../about.json` → 403; `old.reddit.com/.../about.json` → 200 but an HTML login wall, not JSON — see `docs/FAILURES.md`, 2026-08-19), and setting up a registered API app was judged not worth the setup cost for what turned into a manual-collection approach anyway.

**Subreddit existence and activity were instead verified by the user directly via web search**, not by this pipeline's code. This is a deliberate departure from PRAW/automated verification — logged here so it's traceable, per the project's evidence-discipline rule that every claim states its verification method.

## Result

| Subreddit | Status | Use |
|---|---|---|
| r/IndianFashionAddicts | Confirmed real, corroborated | **In** |
| r/indianbeautyhauls | Confirmed real, corroborated | **In** |
| r/TwoXIndia | Confirmed real, corroborated | **In** |
| r/india | Confirmed real, corroborated | **In** |
| r/DesiFashion | No corroboration found | Dropped |
| r/fucknykaa | No corroboration found | Dropped |
| r/Frugal_Ind | No corroboration found | Dropped |
| r/indianfashioncheck | No corroboration found | Dropped |
| r/indianbeautyyappers | No corroboration found | Dropped |
| r/IndianBeautyDeals | No corroboration found | Dropped |
| r/IndianBeautyTalks | No corroboration found | Dropped |

Member counts and post-activity figures were not captured for the confirmed four — the user's web-search verification confirmed existence/plausibility, not the specific activity metrics the original PRAW-based plan would have logged. **This is a limitation, not an omission**: flag it in the source-bias table (v2 Part A.3) as "existence verified, activity not quantified," rather than implying a more rigorous check happened.

## Decision

Proceed with **manual, human-curated collection** from the four confirmed subreddits — not an automated PRAW pull. This is consistent with v2's own fallback language for this exact scenario: "hand-curated Quora and forum threads." Target: 30–50 posts/comments total across the four subreddits, into `data/raw/reddit_manual.jsonl`.

## What this changes downstream

- `scrapers/reddit.py` (PRAW-based) is **not being built** for this pass — collection is manual. If corpus volume later proves insufficient from hand-curation, PRAW becomes the fallback and will need real Reddit API credentials (`REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` / `REDDIT_USER_AGENT`) at that point.
- The source-bias table and evidence labelling in the deck (v2 Part A.3, evidence labels section) should note Reddit evidence here is "Observed, hand-curated by the researcher" rather than "Observed, machine-sampled" — a different (and arguably higher, since a human pre-filtered for relevance) selection bias than the Play Store pull.
