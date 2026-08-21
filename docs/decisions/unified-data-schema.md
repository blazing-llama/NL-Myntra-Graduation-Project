# Decision: Unified Data Schema

**Date:** 2026-08-19
**Context:** Reddit reallocation (`docs/decisions/reddit-source-choice.md`) introduced a second source with different natural fields (a permalink, no star rating) than the original Play Store scraper. Rather than let the two sources diverge, every source — current and future — now writes the same shape.

## Schema

Used at both the raw tier (`data/raw/`) and the cleaned tier (`data/processed/clean_*.json`):

```
{
  "id": string,            # stable, source-derived — see "id generation" below
  "source": string,        # "playstore" | "reddit" | ...
  "text": string,          # verbatim content
  "rating": number | null, # star rating where the source has one (Play Store); null otherwise
  "date": string | null,   # ISO 8601 where available; best-guess date string otherwise
  "url": string | null,    # permalink / deep link back to the original item
  "lang": string | null,   # null in raw input; filled by pipeline/clean.py
  "meta": object           # source-specific extras (app_name, subreddit, upvotes, ...)
}
```

## id generation

- **Play Store:** `playstore-<app_name>-<review_id>` — `review_id` comes from the API, already globally unique.
- **Reddit (hand-curated):** left blank by the human collector. `pipeline/clean.py`'s `ensure_id()` derives a deterministic id as `reddit-<sha1(url)[:12]>` — stable across re-runs (same url always produces the same id), same spirit as Play Store's API-provided id, without requiring the human to compute anything.

## What changed

- `scrapers/playstore.py` — `serialize()` now emits this schema directly (affects future runs only).
- `pipeline/clean.py` — generalized from Play-Store-specific field names to the unified schema; now source-agnostic, reads both `data/raw/*.json` (one object with a `reviews`/`items` list) and `data/raw/*.jsonl` (one record per line — the Reddit hand-curation format).
- `pipeline/relevance_prefilter.py` — updated to read `id`/`text` instead of `evidence_id`/`content`.
- **Already-collected Play Store data was migrated in place**, not re-scraped: `pipeline/migrate_to_unified_schema.py` reshaped `data/raw/playstore_*.json`, `data/processed/clean_*.json`, and `data/processed/relevance_*.json` field-by-field, asserting the item count was unchanged before/after for every file. Ids changed from `<app>-<review_id>` to `playstore-<app>-<review_id>`; every underlying value (text, rating, date, relevance verdict) is identical to what `docs/decisions/product-and-source-choice.md`'s counts (2/2/1 relevant) were computed from. Re-scraping was deliberately avoided — "500 most recent reviews" would return different reviews today than on 2026-08-19, which would have silently invalidated an already-written decision.
