"""
Pull recent App Store (iOS) reviews for the three candidate apps, via
Apple's official public customer-reviews RSS feed (no auth, no
third-party library). Verified working live on 2026-08-24.

Note: a third-party PyPI package (app-store-scraper) was tried first
and pinned an old `requests` that broke the venv's urllib3 compat
(see docs/FAILURES.md, 2026-08-24) — reverted, and this script talks
to Apple's feed directly instead.

The feed paginates 1..10 (~50 reviews/page, ~500 max, often fewer
depending on how many recent reviews Apple's feed actually retains).

Usage:
    .venv/Scripts/python.exe scrapers/appstore.py

Output: one JSON file per app in data/raw/, unified schema
(docs/decisions/unified-data-schema.md).
"""

import json
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

APPS = {
    "myntra": "907394059",
    "ajio": "1113425372",
    "nykaa": "1439872423",  # Nykaa Fashion specifically, distinct from Nykaa Beauty (1022363908)
}

COUNTRY = "in"
MAX_PAGES = 10  # Apple's feed caps out around here regardless of request
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def fetch_reviews(app_id: str) -> list[dict]:
    collected: list[dict] = []
    seen_ids: set[str] = set()

    for page in range(1, MAX_PAGES + 1):
        url = f"https://itunes.apple.com/{COUNTRY}/rss/customerreviews/id={app_id}/sortBy=mostRecent/page={page}/json"
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            break
        entries = resp.json().get("feed", {}).get("entry", [])
        if not entries:
            break

        new_on_page = 0
        for e in entries:
            review_id = e.get("id", {}).get("label")
            if not review_id or review_id in seen_ids:
                continue
            seen_ids.add(review_id)
            collected.append(e)
            new_on_page += 1

        if new_on_page == 0:
            break  # feed repeating itself, no more real pages
        time.sleep(1)

    return collected


def serialize(entry: dict, app_name: str, app_id: str) -> dict:
    review_id = entry.get("id", {}).get("label")
    return {
        "id": f"appstore-{app_name}-{review_id}",
        "source": "appstore",
        "text": entry.get("content", {}).get("label"),
        "rating": int(entry["im:rating"]["label"]) if entry.get("im:rating", {}).get("label") else None,
        "date": entry.get("updated", {}).get("label"),
        "url": f"https://itunes.apple.com/{COUNTRY}/review?id={app_id}&type=Purple%20Software",
        "lang": None,  # filled by pipeline/clean.py
        "meta": {
            "app_name": app_name,
            "title": entry.get("title", {}).get("label"),
            "author": entry.get("author", {}).get("name", {}).get("label"),
            "app_version": entry.get("im:version", {}).get("label"),
            "vote_sum": entry.get("im:voteSum", {}).get("label"),
        },
    }


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    run_at = datetime.now(timezone.utc).isoformat()

    for app_name, app_id in APPS.items():
        print(f"[{app_name}] fetching App Store reviews for id={app_id} ...")
        entries = fetch_reviews(app_id)
        print(f"[{app_name}] fetched {len(entries)} reviews")

        out = {
            "app_name": app_name,
            "app_id": app_id,
            "country": COUNTRY,
            "fetched_at": run_at,
            "actual_count": len(entries),
            "reviews": [serialize(e, app_name, app_id) for e in entries],
        }

        out_path = RAW_DIR / f"appstore_{app_name}.json"
        out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[{app_name}] written to {out_path}")


if __name__ == "__main__":
    main()
