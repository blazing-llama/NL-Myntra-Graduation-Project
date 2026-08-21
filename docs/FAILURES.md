# Failures Log

One entry per failure. Updated the day it happens — not reconstructed at the end.

## 2026-08-19 — Reddit reallocation blocked: no unauthenticated JSON access, no API credentials yet

**Attempt:** before pulling from any candidate subreddit (per the Play Store reallocation decision — see `docs/decisions/product-and-source-choice.md`), tried to check subreddit existence/activity without setting up PRAW credentials first, using Reddit's public JSON endpoints directly.

**Observed error:** `https://www.reddit.com/r/india/about.json` returns HTTP 403. `https://old.reddit.com/r/india/about.json` returns HTTP 200 but with `content-type: text/html` — an HTML "Welcome to Reddit" login wall, not JSON. Confirmed on both, not a one-off.

**Root cause:** Reddit has locked down anonymous/datacenter access to its JSON endpoints as of this date — this is a real, verified platform change, not a bug in this project's code. A registered Reddit API app (`client_id` + `client_secret`, "script" type) via PRAW is required even for read-only existence/activity checks.

**Fix:** none yet — blocked pending the user creating a Reddit API app and adding `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` / `REDDIT_USER_AGENT` to `.env`. Not attempted: browser automation or residential-proxy workarounds to bypass the block — out of scope and likely against Reddit's terms.

**Lesson:** don't assume a previously-known-workable unauthenticated API path (common in older blog posts / library docs) still works today — verify against the live endpoint before designing a scraper around it, same principle as verifying `google-play-scraper` on day 1.

**Do-not-repeat rule:** for any external data source, do a live connectivity smoke test with real auth requirements before writing the full scraper, not after.

## 2026-08-19 — live Groq key in a stray docs/.env.txt almost got committed

**Observed:** during `git init` + first `git add -A`, a file `docs/.env.txt` (not `docs/.env` — Windows extension-hiding, same failure mode flagged earlier for the root directory, but it turned up in `docs/` instead) was staged. It contained a real, live `GROQ_API_KEY` in plaintext. `.gitignore` at the time only excluded a file literally named `.env`, not `.env.txt` — so this would have been committed to git history on the very first commit had `git status` not been checked before committing.

**Root cause:** (1) Windows saved the file with a hidden `.txt` extension the user didn't intend, landing it in the wrong directory. (2) `.gitignore`'s `.env` pattern is an exact-name match, not a prefix match — it does not catch `.env.txt`, `.env.local`, or other variants.

**Fix:** copied the key into the real `.env` at repo root, deleted `docs/.env.txt`, and broadened `.gitignore` to `.env` + `.env.*` (with `!.env.example` re-allowed) so any stray `.env`-prefixed file is caught regardless of extension or directory. Also added `.claude/` to `.gitignore` — harness-internal state (`.claude/scheduled_tasks.lock`) was staged in the same `git add -A` and doesn't belong in the repo.

**Secondary exposure:** the key was `cat`'d to inspect the file before its danger was known, so it is now visible in this session's transcript. Flagged to the user to rotate the key at console.groq.com regardless of the file being deleted.

**Lesson:** `git status`/`git add -A` output must be read line-by-line before every first commit, not just trusted — a broad gitignore pattern written before secrets exist doesn't protect against secrets that show up later in unexpected filenames/locations.

**Do-not-repeat rule:** before any `git add -A` on a repo that handles API keys, grep the staged file list for `env`, `key`, `secret`, `token`, `credential` (case-insensitive) as a last-line check, even when `.gitignore` looks correct.

## 2026-08-19 — n8n webhook: evidence_id dropped on retry-error path

**Attempt:** Static-validated `docs/blueprints/discovery-engine-webhook.json` with the n8n-workflow-validator skill before treating it as working (per project ground rules — it had never been imported into a live n8n instance).

**Observed error:** `Respond: Insufficient Evidence` is reachable via two paths: (1) through `Validate Schema (Retry)`, whose output carries `evidence_id`/`errorMsg`; (2) directly from `Groq: Classify Retry (gpt-oss-120b)`'s own error output (`onError: continueErrorOutput`) when the Groq call itself fails. On path (2), `$json` is n8n's raw HTTP-error object, which has neither field — the response would silently return `evidence_id: undefined`.

**Root cause:** the response body expression read `$json.evidence_id`, which only resolves correctly on one of the two incoming paths.

**Fix:** changed the expression to pull `evidence_id` from `$('Normalize Input').item.json.evidence_id`, which resolves on both paths.

**Lesson:** any node reachable from more than one upstream path needs its expressions checked against *every* path's `$json` shape, not just the happy path.

**Do-not-repeat rule:** when an `onError: continueErrorOutput` node's error output fans into a node also reached via a validated success path, pull identifying fields (IDs, correlation keys) from a fixed upstream node reference, never from `$json` of the immediate predecessor.

**Caveat:** this was static validation only — no live n8n instance was available in this environment. The workflow still needs an actual import + live webhook POST test before it can be called "working" per the ground rules.

## 2026-08-19 — Groq key unavailable; hermes3:8b pull didn't finish; relevance_prefilter.py crashed on Windows default encoding

**Attempt 1 — Groq for relevance pre-filter:** no `GROQ_API_KEY` was configured anywhere (no `.env`, not in environment). User chose to run the pilot's relevance pre-filter against local Ollama instead of blocking on a key.

**Attempt 2 — hermes3:8b:** blueprint specifies `hermes3:8b` via Ollama for local dev/cross-model work. `ollama pull hermes3:8b` (4.7GB) did not complete within the session/tool timeout and exited with an error. Ollama already had `llama3.2:3b` and `llama3.1:latest` installed. Substituted `llama3.1:latest` for this pilot pre-filter only — see `agents/relevance_prefilter_prompt.md` for the substitution note. **This substitution does not extend to E3 (cross-model robustness)**, which specifically needs a model outside the Groq `gpt-oss` lineage; `hermes3:8b` should be re-attempted (or an alternative picked) before that eval runs.

**Attempt 3 — encoding crash:** `pipeline/relevance_prefilter.py` crashed with `UnicodeDecodeError: 'charmap' codec can't decode byte 0x8d` when reading `clean_myntra.json` for a print statement, because `Path.read_text()` on Windows defaults to the system codepage (cp1252), not UTF-8.

**Root cause:** one `read_text()` call in `main()` omitted `encoding="utf-8"` (every other file read/write in the pipeline already specifies it explicitly).

**Fix:** added `encoding="utf-8"` to the missed call.

**Lesson:** on Windows, every `Path.read_text()`/`write_text()` call needs an explicit `encoding="utf-8"` — the platform default silently differs from Linux/Mac and only fails on non-ASCII byte sequences, so a script can pass small smoke tests and still crash on the full run.

**Do-not-repeat rule:** grep any new script for `read_text(` / `write_text(` / `open(` without an explicit `encoding=` before running it for real, not just after a crash.

## 2026-08-19 — relevance_prefilter.py had no progress visibility (health-checked, not a failure)

**Observed:** the re-run (started ~02:05) produced no console output for ~30+ minutes because `subprocess`/background-tool stdout was buffered and the script only writes its one output file per app at the end of that app's loop — no incremental checkpoint file. This made it impossible to distinguish "working slowly" from "hung" from outside.

**Check performed before taking any action:** sampled `ollama ps` (showed `llama3.1:latest` loaded, CPU 100%, idle-timeout continuously resetting to "4 minutes from now" across repeat checks — only happens on fresh inference requests) and took two `Get-Process` CPU-time samples 8s apart for the ollama process (193.66s -> 194.14s, i.e. actively accumulating CPU time). `data/processed/relevance_ajio.json` had already been written mid-run (185/185 items, 2 relevant, 1.1% — consistent with v2's own 1-3% signal-rate estimate). **Conclusion: alive and working, not hung.** Per the user's instruction, left it running rather than killing it.

**Root cause (design gap, not a bug):** the script has no incremental checkpoint (JSONL append per item) and wasn't run with unbuffered stdout, so there is no way to observe progress without inferring liveness indirectly via OS process/CPU checks.

**Lesson:** any script expected to run more than a couple of minutes needs per-item checkpointing (append-as-you-go, not write-once-at-the-end) and unbuffered output from the start — retrofit this into `pipeline/relevance_prefilter.py` and any future long-running pipeline script (coding run, embedding, clustering) before running it for real, not after the first time it's unclear whether it's hung.

**Do-not-repeat rule:** before launching any run expected to take >2 minutes, write results incrementally to a `.jsonl` file and run Python with `-u` (or set `PYTHONUNBUFFERED=1`), so progress is directly observable instead of requiring OS-level process forensics.
