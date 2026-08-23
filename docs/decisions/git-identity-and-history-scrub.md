# Decision: Git Identity Fix, Deferred History Scrub

**Date:** 2026-08-23

## What was found

`git config user.name` / `user.email` (checked 2026-08-23, at the user's request) showed a personal, identifying author on every commit so far:

```
sankalp305zeus <sankalpshah305@gmail.com>
```

All 5 commits at the time of the check (`a4107c9` through `72c1c39`) are attributed to this identity. The email in particular reads as a real name pattern and is a personal Gmail address — a direct conflict with the brief's anonymity requirement (fellow's name nowhere in the repo, per `wishlist-conversion-blueprint-v2.md` Part 0).

## Decision

1. **Fixed going forward:** set a **project-scoped** (local, not global) git identity for this repo only:
   ```
   git config user.name "blazing-llama"
   git config user.email "blazing-llama@users.noreply.github.com"
   ```
   Global git config is untouched — this only affects commits made inside this repository.

2. **Not fixed yet, deliberately:** the existing 5 commits are **not** being rewritten now. Rewriting already-pushed history requires a force-push, which is a destructive, hard-to-reverse action — per project ground rules, that needs an explicit decision, not a default action taken mid-build. Doing it now would also mean a second rewrite is likely needed anyway if anything else identifying surfaces before submission (a name in a commit message, a stray path, etc.) — better to do one clean sweep than several partial ones.

3. **Scheduled for the Sep 3–4 compliance sweep** (`wishlist-conversion-blueprint-v2.md` Part H, "Compliance checklist" — the existing `grep -ri "FELLOW_NAME"` step already anticipates exactly this kind of check). At that point:
   - Rewrite all existing commit authorship (`git filter-repo` or equivalent) to the `blazing-llama` identity
   - Re-run the full repo grep for the personal email/name pattern, not just author fields (commit *messages*, code comments, and file contents could also reference it)
   - Force-push the rewritten history
   - Re-verify on GitHub that no cached/cached-view surface (PR history, GitHub's contributor graph, etc.) still shows the old identity

## Why this order is safe

Nothing about the personal email being on the existing commits is itself broken or blocking — it's a compliance item for submission, not a functional bug. Sequencing it with the rest of the compliance sweep (font size, slide count, PDF metadata, incognito link tests) keeps all "final polish before submission" work in one pass instead of scattered decisions made under different amounts of context.
