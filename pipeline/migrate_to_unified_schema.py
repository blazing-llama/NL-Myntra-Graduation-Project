"""
One-time migration: reshape already-collected Play Store data (raw,
cleaned, relevance-filtered) from the old ad-hoc schema into the
unified schema (docs/decisions/unified-data-schema.md).

Pure reshape — no re-scraping, no re-running the LLM filter. Every
value is preserved; only field names/structure change. Run once, then
this script is historical record, not part of the regular pipeline.

Usage:
    .venv/Scripts/python.exe pipeline/migrate_to_unified_schema.py
"""

import json
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

APPS = ["myntra", "ajio", "nykaa"]


def migrate_raw(app: str) -> tuple[int, int]:
    path = RAW_DIR / f"playstore_{app}.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    before = len(payload["reviews"])

    package_id = payload["package_id"]
    migrated = []
    for r in payload["reviews"]:
        review_id = r.get("review_id")
        migrated.append(
            {
                "id": f"playstore-{app}-{review_id}",
                "source": "playstore",
                "text": r.get("content"),
                "rating": r.get("score"),
                "date": r.get("at"),
                "url": f"https://play.google.com/store/apps/details?id={package_id}&reviewId={review_id}"
                if review_id
                else None,
                "lang": None,
                "meta": {
                    "app_name": app,
                    "user_name": r.get("user_name"),
                    "thumbs_up_count": r.get("thumbs_up_count"),
                    "review_created_version": r.get("review_created_version"),
                    "app_version": r.get("app_version"),
                    "reply_content": r.get("reply_content"),
                    "reply_at": r.get("reply_at"),
                },
            }
        )

    payload["reviews"] = migrated
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return before, len(migrated)


def migrate_clean(app: str) -> tuple[int, int]:
    path = PROCESSED_DIR / f"clean_{app}.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    before = len(payload["reviews"])

    migrated = []
    for r in payload["reviews"]:
        old_evidence_id = r["evidence_id"]  # "<app>-<review_id>"
        review_id = old_evidence_id.split("-", 1)[1]
        migrated.append(
            {
                "id": f"playstore-{old_evidence_id}",
                "source": "playstore",
                "text": r.get("content"),
                "rating": r.get("score"),
                "date": r.get("at"),
                "url": None,  # not carried in the old clean schema; not needed for the id remap
                "lang": r.get("detected_lang"),
                "meta": {"app_name": app},
                "_old_evidence_id": old_evidence_id,  # traceability aid, stripped below
            }
        )

    new_payload = {
        "raw_file": f"playstore_{app}.json",
        "counts": payload["counts"],
        "items": migrated,
    }
    path.write_text(json.dumps(new_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return before, len(migrated)


def migrate_relevance(app: str) -> tuple[int, int]:
    path = PROCESSED_DIR / f"relevance_{app}.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    before = len(payload["results"])

    migrated = []
    for r in payload["results"]:
        old_evidence_id = r["evidence_id"]
        new_id = f"playstore-{old_evidence_id}"
        entry = {k: v for k, v in r.items() if k not in ("evidence_id", "content")}
        migrated.append({"id": new_id, "text": r["content"], **entry})

    new_payload = {"name": app, "counts": payload["counts"], "results": migrated}
    path.write_text(json.dumps(new_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return before, len(migrated)


def main() -> None:
    for app in APPS:
        rb, ra = migrate_raw(app)
        cb, ca = migrate_clean(app)
        vb, va = migrate_relevance(app)
        assert rb == ra, f"{app} raw count changed: {rb} -> {ra}"
        assert cb == ca, f"{app} clean count changed: {cb} -> {ca}"
        assert vb == va, f"{app} relevance count changed: {vb} -> {va}"
        print(f"[{app}] raw {rb}->{ra}, clean {cb}->{ca}, relevance {vb}->{va} (all preserved)")

    # Strip the traceability-only _old_evidence_id field once migration is verified
    for app in APPS:
        path = PROCESSED_DIR / f"clean_{app}.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        for item in payload["items"]:
            item.pop("_old_evidence_id", None)
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print("Migration complete.")


if __name__ == "__main__":
    main()
