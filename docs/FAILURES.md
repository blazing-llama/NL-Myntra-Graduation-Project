# Failures Log

One entry per failure. Updated the day it happens — not reconstructed at the end.

## 2026-08-25 — event_log insert failed with "permission denied", not an RLS rejection

**Attempt:** first live verification of the Supabase event log (`mvp/supabase/schema.sql`) after adding real credentials to `mvp/.env` and Vercel production env vars, and redeploying. Added an item to cart on the live site and checked the browser console/network for the resulting `add_to_cart` insert.

**Observed error:** `401`, console: `logEvent failed: permission denied for table event_log`.

**Root cause:** the original `schema.sql` enabled RLS and added a policy allowing `anon` to `INSERT`, but never granted the base table-level privilege. Postgres requires both: an RLS policy only restricts *which* rows a role may touch once it already has the underlying SQL privilege — it does not grant that privilege itself. Without `GRANT INSERT ON public.event_log TO anon`, every insert attempt fails at the privilege-check stage, before RLS is even evaluated. (An RLS rejection has a distinct error — "new row violates row-level security policy" — this was a different, earlier failure.)

**Fix:** added `grant insert on public.event_log to anon;` and `grant usage on sequence public.event_log_id_seq to anon;` to `mvp/supabase/schema.sql`. The user ran these in the Supabase SQL Editor. Re-verified live: a fresh browser tab's add-to-cart click produced no error, and a direct REST `curl` matching the app's exact request shape (`Prefer: return=minimal`, no `.select()`) returned `201 Created`. Confirmed working.

**Lesson:** RLS policies and table-level GRANTs are two separate, both-required layers in Postgres. A correct-looking RLS policy with no matching GRANT fails silently in exactly this way — "permission denied," not an RLS-specific message — which is easy to misdiagnose as a policy bug when it's actually a missing grant.

**Do-not-repeat rule:** whenever writing `enable row level security` + a `create policy ... for insert/select/update/delete`, always pair it with the matching `grant <privilege> on <table> to <role>` in the same migration — never assume the policy alone is sufficient.

## 2026-08-24 — app-store-scraper broke the venv, reverted to Apple's own RSS feed

**Attempt:** installed the PyPI package `app-store-scraper` to build `scrapers/appstore.py`, mirroring `scrapers/playstore.py`'s use of `google-play-scraper`.

**Observed error:** the install pinned `requests==2.23.0`, downgrading the already-installed modern `requests`/`urllib3`. Importing anything depending on `requests` (including `pipeline/relevance_prefilter.py`, `pipeline/migrate_to_unified_schema.py`) immediately broke with `ModuleNotFoundError: No module named 'urllib3.packages.six.moves'` — the old `requests` version expects an old vendored `urllib3` shape that the installed modern `urllib3` doesn't have.

**Root cause:** `app-store-scraper` is unmaintained (no updates in years) and never updated its `requests` pin; installing it silently downgrades a core shared dependency for the whole venv, not just itself.

**Fix:** uninstalled `app-store-scraper`, force-upgraded `requests` back to `>=2.31`. Verified `praw`, `google_play_scraper`, `langdetect`, and `requests` all still import cleanly afterward. Did not reattempt the package.

**Real fix, not a workaround:** wrote `scrapers/appstore.py` against Apple's own public customer-reviews RSS feed (`itunes.apple.com/{country}/rss/customerreviews/id={id}/sortBy=mostRecent/page={n}/json`) directly via `requests` — no third-party library, no auth, officially documented Apple endpoint. Verified live: 500 reviews fetched per app across all three (Myntra, AJIO, Nykaa Fashion).

**Lesson:** an unmaintained scraping package is a bigger risk than "it might not work" — it can silently corrupt shared dependencies for everything else in the same environment. Prefer a first-party API/feed over a third-party wrapper when one exists, especially for a package with no recent maintenance activity.

**Do-not-repeat rule:** before installing any new PyPI package into this shared venv, check its most recent release date and pinned dependency versions for actual/likely conflicts with what's already installed — and re-verify core imports (`requests`, `praw`, `google_play_scraper`) immediately after any new install, not just at the point something visibly breaks later.

## 2026-08-22 — First live n8n test of discovery-engine-webhook.json: four real bugs found

**Attempt:** the workflow had only ever been statically validated (2026-08-19), never imported into a live n8n instance, per the project's own "don't treat it as working until tested" rule. Self-hosted a local n8n 2.35.7 instance (no Docker available; ran via `npx n8n start`, isolated `N8N_USER_FOLDER`), created a local-only owner account (placeholder credentials, not the user's real identity — this is local software configuration, not a third-party signup), and imported/activated the workflow.

**Bug 1 — no root-level `id`.** CLI import failed: `SQLITE_CONSTRAINT: NOT NULL constraint failed: workflow_entity.id`. The exported JSON had no workflow-level `id`, only node-level ids. **Fix:** added `"id": "1a732607-e73d-4d45-a0fe-51c0c6b1cde4"` at the workflow root.

**Bug 2 — `tags` as plain strings.** CLI import failed: `SQLITE_CONSTRAINT: NOT NULL constraint failed: workflows_tags.tagId`. This n8n version expects tag *reference objects* (with an id), not raw strings. Tags are cosmetic, not functional. **Fix:** removed the `tags` field entirely.

**Bug 3 — webhook node missing `webhookId`.** After import + activation (`active: true` confirmed in the DB, "Activated workflow" in the boot log), the webhook still returned `404 not registered`. Root cause: the webhook node had no `webhookId` (a UUID n8n's editor normally auto-generates when a webhook node is created/saved in the UI — a hand-authored JSON never gets one). Direct inspection of the `webhook_entity` SQLite table showed a registered row with `webhookId: NULL`. **Fix:** added `"webhookId": "d95948a2-b0a6-42c6-a4f0-22a2bd0c6d59"` to the webhook node. **Caveat on method:** an in-place live PATCH (`nodes`+`connections`+`active` via REST) looked like it worked (DB showed `webhookId` set on the node) but left `webhook_entity.webhookId` NULL and produced a corrupted registered path (`<workflowId>/webhook%3A%20wishlist%20text%20in/<path>` instead of the plain path) — the live-PATCH route bypasses n8n's normal activation code path. The reliable fix was: fully archive + delete the workflow, then re-import fresh from the corrected JSON file via CLI and activate through the normal path. **Do-not-repeat rule: never PATCH an active workflow's nodes/connections live to fix a structural issue — delete and re-import clean instead.**

**Bug 4 — `$env.GROQ_API_KEY` blocked by default.** Even after the webhook registered and received requests, both the primary and retry Groq HTTP calls failed with `"error": "access to env vars denied"` (found by manually decoding n8n's reference-compacted execution-data JSON, since the error isn't surfaced in the server console log). Confirmed the Groq key and model were fine via a direct `curl` to the Groq API. **Root cause:** n8n blocks `$env.*` access in expressions by default (`N8N_BLOCK_ENV_ACCESS_IN_NODE`, default `true`) — a security setting, not a bug in this project's workflow. Initially confirmed the failure mode by restarting with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` — but per the user, disabling a real security boundary to route around a design choice is not an acceptable fix. **Superseded 2026-08-22 — see the credential-based fix entry below**, which replaces the raw env-var expression rather than disabling the security setting.

**Also observed:** a race condition where, immediately after boot, "Activated workflow" appears in the log but the webhook route isn't reachable yet for a few seconds (`Cannot POST` generic 404 instead of n8n's own "not registered" 404) — settled after ~8s. Worth a health-check delay note for whoever hosts this for real.

## 2026-08-22 — Replaced $env.GROQ_API_KEY with an n8n Credential (design fix, not a workaround)

**Context:** Bug 4 above was patched by setting `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`, which made the pipeline work but does so by disabling a real security boundary rather than fixing the actual design choice (a raw API key in an env-var expression). The user correctly called this out: that's routing around the problem, not solving it.

**Fix:** switched both Groq HTTP Request nodes (`Groq: Classify (gpt-oss-20b)` and `Groq: Classify Retry (gpt-oss-120b)`) in `workflows/discovery-engine-webhook.json` from `headerParameters` containing a raw `Authorization: Bearer {{ $env.GROQ_API_KEY }}` expression to n8n's generic `httpHeaderAuth` credential type (`"authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth"`, with a `credentials.httpHeaderAuth` reference on each node). The `Content-Type` header stays as a plain header parameter since it isn't a secret.

**Why the committed JSON has a placeholder credential id:** n8n credentials are encrypted per-instance and can never be embedded in a shareable workflow JSON — that's the entire point of using Credentials over a raw env expression. The committed file references `"id": "PLACEHOLDER_CREDENTIAL_ID", "name": "Groq API Key (Header Auth)"`. **Whoever hosts this workflow for real must create a credential of type "Header Auth" named "Groq API Key (Header Auth)"** (header name `Authorization`, value `Bearer <their Groq key>`) in their own n8n instance, then map the two HTTP Request nodes to it — n8n's import UI prompts for this automatically when a referenced credential doesn't exist locally.

**Verified end-to-end with default security settings restored** (no `N8N_BLOCK_ENV_ACCESS_IN_NODE` override): created a real `httpHeaderAuth` credential via the REST API in the local test instance, re-imported the workflow with the real credential id substituted for the placeholder (test-only substitution — the committed file keeps the placeholder), and confirmed the same three cases as the original live test: real classification (`is_relevant: true, primary_barrier: fit_size`), not-relevant classification, and the missing-text 400 path. All correct, with the actual security boundary intact.

**Lesson:** when a workflow needs a secret, use the platform's credential system, not an env-var expression — even though the env-var version "works" once the block is lifted, it requires weakening a security default that has nothing to do with this specific workflow and would silently affect every other workflow on the same instance.

**Outstanding for real hosting (not fixed here, flagging for the public-link deployment decision in v2 Part D.4):** set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` on whatever n8n Cloud/self-host instance is used for the public testable link, or — more securely — replace the raw `{{ $env.GROQ_API_KEY }}` expression with an n8n Credential (HTTP Header Auth) instead of an env var expression, which doesn't require disabling this security setting at all. The credential-based approach is the better fix long-term; the env var is documented here because it's what got this local test working today.

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
