---
description: Append a completed-task entry to the repository's JOURNAL.md work log, compacting older entries when the file grows. Usage: /three-axes-log [note].
---

Append an entry to the repository work log.

The arguments passed to this command are: $ARGUMENTS

IR-08 closes the loop inside the conversation. This closes it on disk. The log exists so the next agent — a fresh session, a different model, a colleague — can read what was done and why without re-deriving it from the diff, and without burning tokens rebuilding context that already existed an hour ago.

Follow these steps:

1. **Locate the log.** Run `git rev-parse --show-toplevel` via Bash; use `JOURNAL.md` at that root, or in the current working directory if this is not a git repo. Create the file with a `# Journal` heading if it does not exist. If a `BITACORA.md` is there from an earlier version of this command, rename it to `JOURNAL.md` (`git mv` where the repo is tracked) and continue in it — two parallel logs are worse than either one.

2. **Write the entry from what actually happened this session**, using `$ARGUMENTS` as the developer's framing if provided. Newest entries go at the top, directly under the heading.

```markdown
## <YYYY-MM-DD> — <the task, in one line>

- **Done:** what changed, and where.
- **Verified:** what was actually checked, and how. If nothing was verified, say so — an unverified change is the single most useful thing for the next session to know (IR-01).
- **Open:** what is still broken, untested, or deliberately deferred.
- **Ruled out:** approaches tried and abandoned, with the reason. Omit the line if there were none.
- **Files:** the files that matter, not every file touched.
```

3. **Write in the language the repository already uses.** Match the existing log and the surrounding docs; do not mix languages within an entry.

4. **Record only what happened.** No plans, no intentions, no speculation about what the next session should do beyond what is genuinely open. A log padded with plausible-sounding filler is worse than a short one, because the next reader cannot tell the difference (IR-03).

5. **Compact when the log grows past roughly 40 entries or 500 lines.** Fold everything older than the most recent 15 entries into a single `## Resumen histórico` / `## Historical summary` section at the bottom, one line per entry. Compaction is lossy by design, but two things are never dropped: **decisions** (what was chosen and why) and **failures** (what was ruled out and why). Those are what stop the next session from re-litigating a settled question or re-walking a dead end. Routine detail — file lists, verification steps for work long since superseded — is what goes.

6. **Confirm in one line** — the path written and the entry title. Nothing further.

## Making other agents use it

The log only pays off if every agent working in the repo maintains it. Add this to the repository's `CLAUDE.md` (and `AGENTS.md`, if other tools read the work):

```markdown
## Work log

After completing any task, append an entry to `JOURNAL.md` at the repo root:
what changed, what was verified and how, what is still open, what was ruled
out and why, and the files that matter. Newest first.

Read it before starting work — it is why you do not have to rebuild context
that a previous session already established.

Compact when it passes ~40 entries: fold all but the most recent 15 into a
historical summary, one line each. Never drop a decision or a recorded
failure; drop routine detail instead.
```
