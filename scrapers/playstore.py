"""
Pull recent Play Store reviews for the three candidate apps.

Verified working against the live Play Store on 2026-08-19 (see
docs/decisions/product-and-source-choice.md and docs/experiment_manifest.md).

Usage:
    .venv/Scripts/python.exe scrapers/playstore.py

Output: one JSON file per app in data/raw/, committed as disaster insurance.
Never depend on live scraping again after this run — per v2 Part D.1.
"""

import json
import time
from datetime import datetime, timezone
from pathlib import Path

from google_play_scraper import Sort, reviews

APPS = {
    "myntra": "com.myntra.android",
    "ajio": "com.ril.ajio",
    "nykaa": "com.fsn.nykaa",
}

REVIEWS_PER_APP = 500
BATCH_SIZE = 200  # google-play-scraper's internal page size cap
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def fetch_reviews(package_name: str, target_count: int) -> list[dict]:
    collected: list[dict] = []
    token = None
    while len(collected) < target_count:
        remaining = target_count - len(collected)
        batch, token = reviews(
            package_name,
            lang="en",
            country="in",
            sort=Sort.NEWEST,
            count=min(BATCH_SIZE, remaining),
            continuation_token=token,
        )
        if not batch:
            break
        collected.extend(batch)
        if token is None:
            break
        time.sleep(1)  # be polite to the endpoint between pages
    return collected[:target_count]


def serialize(entry: dict) -> dict:
    return {
        "review_id": entry.get("reviewId"),
        "user_name": entry.get("userName"),
        "content": entry.get("content"),
        "score": entry.get("score"),
        "thumbs_up_count": entry.get("thumbsUpCount"),
        "review_created_version": entry.get("reviewCreatedVersion"),
        "at": entry.get("at").isoformat() if entry.get("at") else None,
        "reply_content": entry.get("replyContent"),
        "reply_at": entry.get("repliedAt").isoformat() if entry.get("repliedAt") else None,
        "app_version": entry.get("appVersion"),
    }


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    run_at = datetime.now(timezone.utc).isoformat()

    for app_name, package_id in APPS.items():
        print(f"[{app_name}] fetching {REVIEWS_PER_APP} reviews from {package_id} ...")
        raw_reviews = fetch_reviews(package_id, REVIEWS_PER_APP)
        print(f"[{app_name}] fetched {len(raw_reviews)} reviews")

        out = {
            "app_name": app_name,
            "package_id": package_id,
            "fetched_at": run_at,
            "requested_count": REVIEWS_PER_APP,
            "actual_count": len(raw_reviews),
            "reviews": [serialize(r) for r in raw_reviews],
        }

        out_path = RAW_DIR / f"playstore_{app_name}.json"
        out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{app_name}] written to {out_path}")


if __name__ == "__main__":
    main()
