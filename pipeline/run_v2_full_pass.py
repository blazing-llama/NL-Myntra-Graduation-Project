"""
One self-contained, checkpointed, resumable pipeline run:

1. Scrape ~333 new RATING-sorted Play Store reviews per app (Myntra/AJIO/
   Nykaa), complementing the existing 500/app NEWEST-sorted pull, to
   diversify toward complaint/hesitation content -- ~1,000 new raw
   reviews total. Skipped per-app if already done (idempotent).
2. Merge new + existing Play Store raw data, dedupe by id. App Store
   data is already fully scraped (data/raw/appstore_*.json) -- nothing
   to re-scrape there.
3. Clean every raw source (reuses pipeline/clean.py's logic directly).
4. Classify the FULL cleaned corpus under the v2 prompt
   (prompts/relevance_prefilter/v2-2026-08-25.md) -- both the corpus
   that was previously classified under v1 and the new increment, since
   v1/v2 results cannot be mixed into one relevance-rate figure.
5. Progress logged to a timestamped file under logs/ -- item count,
   running rate, ETA -- safe to `tail -f`.

Resumability: classification progress is checkpointed to
data/processed/relevance_v2_checkpoint.jsonl, one line appended per
classified item as soon as it completes. Re-running this script after
an interruption (Ctrl+C, closed laptop, etc.) skips every id already in
the checkpoint file and continues from there -- it does not restart
classification from zero. The scrape step is separately idempotent per
app (checks how many rating-sorted items are already in the raw file).

Usage:
    .venv/Scripts/python.exe pipeline/run_v2_full_pass.py

Safe to interrupt (Ctrl+C) at any point and re-run the exact same
command to resume.
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clean as clean_module  # noqa: E402  (pipeline/clean.py, same directory)
from relevance_prefilter import MODEL, SYSTEM_PROMPT, classify  # noqa: E402

from google_play_scraper import Sort, reviews  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
LOG_DIR = ROOT / "logs"
CHECKPOINT_PATH = PROCESSED_DIR / "relevance_v2_checkpoint.jsonl"

APPS = {
    "myntra": "com.myntra.android",
    "ajio": "com.ril.ajio",
    "nykaa": "com.fsn.nykaa",
}
NEW_REVIEWS_PER_APP = 333
BATCH_SIZE = 200


def log_line(log_file, message: str) -> None:
    stamped = f"[{datetime.now().isoformat(timespec='seconds')}] {message}"
    print(stamped, flush=True)
    log_file.write(stamped + "\n")
    log_file.flush()


# ---------------------------------------------------------------------------
# Phase 1+2: scrape new RATING-sorted reviews, merge into existing raw files
# ---------------------------------------------------------------------------


def serialize(entry: dict, app_name: str, package_id: str) -> dict:
    review_id = entry.get("reviewId")
    return {
        "id": f"playstore-{app_name}-{review_id}",
        "source": "playstore",
        "text": entry.get("content"),
        "rating": entry.get("score"),
        "date": entry.get("at").isoformat() if entry.get("at") else None,
        "url": f"https://play.google.com/store/apps/details?id={package_id}&reviewId={review_id}"
        if review_id
        else None,
        "lang": None,
        "meta": {
            "app_name": app_name,
            "sort_method": "rating_ascending",
            "user_name": entry.get("userName"),
            "thumbs_up_count": entry.get("thumbsUpCount"),
            "review_created_version": entry.get("reviewCreatedVersion"),
            "app_version": entry.get("appVersion"),
        },
    }


def scrape_and_merge(app_name: str, package_id: str, log_file) -> None:
    raw_path = RAW_DIR / f"playstore_{app_name}.json"
    payload = json.loads(raw_path.read_text(encoding="utf-8"))
    existing_items = payload["reviews"]
    existing_ids = {item["id"] for item in existing_items}

    already_new = sum(1 for i in existing_items if i.get("meta", {}).get("sort_method") == "rating_ascending")
    if already_new >= NEW_REVIEWS_PER_APP:
        log_line(log_file, f"[scrape:{app_name}] already have {already_new} rating-sorted reviews, skipping")
        return

    log_line(log_file, f"[scrape:{app_name}] fetching ~{NEW_REVIEWS_PER_APP} new RATING-sorted reviews...")
    collected: list[dict] = []
    token = None
    pages_tried = 0
    while len(collected) < NEW_REVIEWS_PER_APP and pages_tried < 15:
        batch, token = reviews(
            package_id,
            lang="en",
            country="in",
            sort=Sort.RATING,
            count=BATCH_SIZE,
            continuation_token=token,
        )
        pages_tried += 1
        if not batch:
            break
        for entry in batch:
            candidate = serialize(entry, app_name, package_id)
            if candidate["id"] not in existing_ids:
                collected.append(candidate)
                existing_ids.add(candidate["id"])
        if token is None:
            break
        time.sleep(1)

    payload["reviews"] = existing_items + collected
    payload["actual_count"] = len(payload["reviews"])
    raw_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    log_line(log_file, f"[scrape:{app_name}] added {len(collected)} new reviews (total now {len(payload['reviews'])})")


# ---------------------------------------------------------------------------
# Phase 3: clean every raw source
# ---------------------------------------------------------------------------


def clean_everything(log_file) -> dict[str, dict]:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    cleaned_by_name = {}
    raw_files = sorted(RAW_DIR.glob("*.json")) + sorted(RAW_DIR.glob("*.jsonl"))
    for raw_file in raw_files:
        # playstore_<app> collapses to <app> (matches clean.py's existing
        # convention); appstore_<app> and reddit keep their full stem.
        if raw_file.stem.startswith("playstore_"):
            name = raw_file.stem.replace("playstore_", "")
        else:
            name = raw_file.stem.replace("_manual", "")
        result = clean_module.clean_file(raw_file)
        cleaned_by_name[name] = result
        out_path = PROCESSED_DIR / f"clean_{name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    log_line(log_file, f"[clean] {len(cleaned_by_name)} sources cleaned: {sorted(cleaned_by_name.keys())}")
    return cleaned_by_name


# ---------------------------------------------------------------------------
# Phase 4: classify the full corpus under v2, checkpointed + resumable
# ---------------------------------------------------------------------------


def load_checkpoint() -> dict[str, dict]:
    done: dict[str, dict] = {}
    if CHECKPOINT_PATH.exists():
        with CHECKPOINT_PATH.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    row = json.loads(line)
                    done[row["id"]] = row
    return done


def classify_everything(cleaned_by_name: dict[str, dict], log_file) -> None:
    all_items = []
    for name, result in cleaned_by_name.items():
        for item in result["items"]:
            all_items.append((name, item))

    done = load_checkpoint()
    total = len(all_items)
    remaining = [(name, item) for name, item in all_items if item["id"] not in done]

    log_line(
        log_file,
        f"[classify] {len(done)}/{total} already done (resumed from checkpoint), "
        f"{len(remaining)} remaining, model={MODEL}, prompt=v2",
    )

    start = time.time()
    checkpoint_file = CHECKPOINT_PATH.open("a", encoding="utf-8")
    for i, (name, item) in enumerate(remaining, start=1):
        result = classify(item["text"], item_id=item["id"])
        row = {
            "id": item["id"],
            "source_name": name,
            "text": item["text"],
            **result,
            "classified_at": datetime.now(timezone.utc).isoformat(),
        }
        checkpoint_file.write(json.dumps(row, ensure_ascii=False) + "\n")
        checkpoint_file.flush()

        if i % 10 == 0 or i == len(remaining):
            elapsed = time.time() - start
            rate = i / elapsed if elapsed > 0 else 0
            eta_seconds = (len(remaining) - i) / rate if rate > 0 else 0
            log_line(
                log_file,
                f"[classify] {len(done) + i}/{total} total done "
                f"({i}/{len(remaining)} this run) | "
                f"rate={rate:.2f} items/s | ETA {eta_seconds / 60:.1f} min",
            )
    checkpoint_file.close()

    # Rebuild the per-source relevance_<name>.json files + summary from the
    # full checkpoint, so downstream consumers see one consistent v2 result.
    done = load_checkpoint()
    by_source: dict[str, list[dict]] = {}
    for row in done.values():
        by_source.setdefault(row["source_name"], []).append(row)

    summary = {}
    for name, rows in by_source.items():
        counts = {"total": 0, "relevant": 0, "not_relevant": 0, "classification_failed": 0}
        results = []
        for r in rows:
            counts["total"] += 1
            if r.get("is_relevant") is None:
                counts["classification_failed"] += 1
            elif r["is_relevant"]:
                counts["relevant"] += 1
            else:
                counts["not_relevant"] += 1
            results.append({k: v for k, v in r.items() if k not in ("source_name", "classified_at")})
        summary[name] = counts
        out_path = PROCESSED_DIR / f"relevance_{name}.json"
        out_path.write_text(
            json.dumps({"name": name, "counts": counts, "results": results}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    summary_path = PROCESSED_DIR / "relevance_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    log_line(log_file, f"[classify] done. Summary: {json.dumps(summary)}")


def main() -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = LOG_DIR / f"run_v2_full_pass_{timestamp}.log"

    with log_path.open("a", encoding="utf-8") as log_file:
        log_line(log_file, f"=== run_v2_full_pass starting, log at {log_path} ===")

        for app_name, package_id in APPS.items():
            scrape_and_merge(app_name, package_id, log_file)

        cleaned_by_name = clean_everything(log_file)
        classify_everything(cleaned_by_name, log_file)

        log_line(log_file, "=== run_v2_full_pass complete ===")


if __name__ == "__main__":
    main()
