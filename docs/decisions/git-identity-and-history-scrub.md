# Decision: Git Identity Fix, History Scrub

**Date:** 2026-08-23, history rewritten 2026-09-03

**Status: DONE.** Section "Not fixed yet" below is historical — see "History scrub completed" at the bottom.

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

## History scrub completed — 2026-09-03

Run ahead of the Sep 3–4 sweep window at the user's explicit instruction ("highest-priority open item"), not silently deferred further.

**Method:** `pip install git-filter-repo`, then a one-line mailmap (`sankalp305zeus <sankalpshah305@gmail.com>` → `blazing-llama <blazing-llama@users.noreply.github.com>`) applied via `git filter-repo --mailmap scrub.mailmap --force`, rewriting author *and* committer identity on every commit, not just the 5 originally flagged (26 commits existed by this point). The working tree had one pre-existing uncommitted edit (`docs/SESSION_HANDOFF.md`) at the time — stashed before the rewrite (filter-repo requires a clean tree) and popped back afterward, unmodified.

**Verification performed:**
- `git log --format="%an|%ae|%cn|%ce" | sort -u` → single result, `blazing-llama` on both author and committer, across all commits.
- Full-history content grep (`git log --all -p` piped through a case-insensitive match on the old name/email) → the **only** remaining hit is the quoted string in this file itself, explaining the finding — a deliberate historical record, not a leak. No hits in any commit message or any other file's content, at any point in history.
- `git remote -v` re-added after filter-repo's safety default removed it; force-pushed with `git push --force origin main`.

**A local tag (`backup-before-identity-scrub-20260903`) was created before rewriting** as an extra safety net, though since filter-repo rewrites all refs it now points at the *rewritten* commit, not the original — the real safety net was that `origin/main` held the untouched original history until the force-push, and `git filter-repo` keeps its own internal backup of original ref values besides.

**Known limitation, not fixed by this step:** commit hashes changed for every commit as a result of the rewrite. Two docs reference the old hashes as historical fact (this file's "What was found" section above, and `docs/SESSION_HANDOFF.md`'s git-status note) — left as-is, since they're accurately describing what was true *at the time of that check*, not claiming to be the current HEAD.

**Not yet independently re-verified:** GitHub's own cached views (PR history if any, contributor graph, commit-search indexing) after the force-push — per the original plan's own item 4. Worth a manual look before submission, since GitHub's search index in particular can lag a force-push by longer than a quick check would catch.
