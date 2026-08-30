---
description: Stop and audit a rule violation. Usage: /three-axes-audit [what went wrong]. Names the violated Integrity Rule by ID, diagnoses the cause, proposes a correction. Emits no code.
---

Run a Three Axes Framework integrity audit.

The arguments passed to this command are: $ARGUMENTS

This command is invoked when the developer has observed a failure — drift, an unrequested change, a confident wrong answer, a guess-patch loop, a false claim of success. It is a hard interrupt.

**Absolute constraints for this turn:**

- Write **no new code**. No fix, no patch, no illustrative snippet. Quoting the offending output verbatim as evidence is required by step 2 and is not an emission — an IR-04 or IR-05 violation *is* code, and an audit that cannot show it is worthless. Quote it; do not correct it.
- **One acknowledgement at most**, and only if something was actually damaged — "that deleted uncommitted work" is a fact worth stating. Then stop. No apology loop, no self-criticism, no "you're absolutely right" (IR-12). Owning the error is done by naming it accurately in the audit, not by apologising for it (IR-09).
- Do not resume the interrupted task. The developer decides what happens next.

Follow these steps:

1. **Read the evidence.** Take `$ARGUMENTS` as the developer's account of what went wrong. If it is empty, audit against the most recent few turns of your own output instead.

2. **Identify the violated rule(s) by ID.** Check the transcript against the thirteen Integrity Rules (IR-01 … IR-13) and the six principles. List every rule that was actually violated, quoting the specific output that violated it.

   **Do not manufacture a violation.** If nothing in the ruleset covers what went wrong, say so explicitly:

   > No existing rule covers this failure. Candidate rule: [one-line statement of the rule that would have caught it].

   A ruleset that grows from real failures is worth more than one that produces a confession on demand. Reporting a clean audit honestly is itself compliance with IR-01 and IR-09.

3. **Diagnose the cause — mechanically, not morally.** State what actually produced the failure. Useful causes look like: an instruction fell out of recent context; a plan was inferred rather than confirmed; an assumption was substituted for a missing input; verification was skipped because the change looked small. Useless causes look like: "I made a mistake", "I should have been more careful".

4. **Propose a concrete correction.** Not an intention — a mechanism. What will be done differently, and what makes it stick: a re-read of the relevant file, a restated constraint held in the next turns, a check performed before the next delivery, a narrower task boundary.

5. **Assess context health.** State one of:
   - **CLEAN** — an isolated slip; the session can continue as-is.
   - **DEGRADED** — instructions are being dropped or corrections are not holding. Recommend `/three-axes-handoff` and a fresh session.
   - **COMPROMISED** — the same failure has now recurred after correction (IR-06). Recommend stopping this session and restarting from a handoff document.

6. **Stop.** End the response after the assessment. Do not ask what to do next, do not offer options, do not begin the correction. Wait for instruction.

**Output format:**

```
INTEGRITY AUDIT

VIOLATED:    IR-nn — <rule name>
             "<the specific output that violated it>"
             [repeat per rule, or: "None. Candidate rule: ..."]

CAUSE:       <mechanical account of what produced it>

CORRECTION:  <the mechanism that prevents recurrence>

CONTEXT:     CLEAN | DEGRADED | COMPROMISED — <one line of justification>
```
