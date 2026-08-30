---
description: Generate a session continuity document for handing work to a fresh session. Usage: /three-axes-handoff [output-path]. Captures state, failure log, intent map, and open questions.
---

Generate a Three Axes Framework handoff document.

The arguments passed to this command are: $ARGUMENTS

A session degrades before it ends: corrections stop holding, earlier instructions get dropped, the same suggestion resurfaces. Grinding on is expensive and rarely works. This command captures what the current session actually knows so a fresh one can resume without relearning it — including the parts that are usually lost, which are the failures and the reasons behind code that looks inert.

Follow these steps:

1. **Determine the output target.** If `$ARGUMENTS` contains a path, write the document there with the Write tool and confirm the location. If empty, print the document into the conversation so the developer can place it themselves. Do not write files to unrequested locations (IR-04).

2. **Gather the content from this session's actual history** — not from a re-reading of the codebase, which the next session can do for itself. Where a fact is uncertain, mark it uncertain rather than smoothing it over (IR-03).

3. **Produce the document in this structure:**

```markdown
# Handoff — <project or task name> — <date>

## Profile
mastery: <value> · consequence: <value> · intent: <value>
Restore with: /three-axes-set mastery=<v> consequence=<v> intent=<v>
Integrity Rules IR-01 … IR-13 apply from the first turn.

## Objective
What we are building and *why* — the goal behind the task, not just the task.
Without this the next session optimizes the wrong thing.

## Current state
- **Working:** what has been verified, and how it was verified.
- **Broken:** what is known to fail, with the symptom.
- **Half-done:** what was started and left mid-flight, and where the seam is.

## Failure log
Every approach that was tried and abandoned:

| Attempt | Result | Why it failed |
|---|---|---|

This section is the point of the document. Without it the next session
re-derives the same dead ends and burns the same hours.

## Intent map
Code that looks removable but is not: unreferenced functions, defensive
branches, seemingly redundant state, deliberate duplication. For each, one
line on why it exists. Prevents a well-meaning cleanup from causing a
regression.

## Open questions
Decisions the developer has not made yet, and what each one blocks.

## Files that matter
The specific files the next session needs, and one line on what each is for.
A full dump is not a handoff — it is the same problem in a new window.

## Caveat
Everything above is the outgoing session's hypothesis, including the
diagnoses in "Broken" and the reasons in the failure log. Verify against the
code before acting on any of it. If the diagnosis were reliable, this handoff
would probably not have been necessary.
```

4. **Fill every section from real session content.** An empty section is stated as empty — "No failed attempts this session" — never padded with plausible-sounding filler. Fabricated handoff content is worse than a short handoff, because the next session has no way to tell the difference.

5. **Close with a one-line status** naming where the document was written, or that it was printed. Nothing further.
