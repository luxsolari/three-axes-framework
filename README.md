# Three Axes Framework

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.5.0-informational.svg)](CHANGELOG.md)

A Claude Code plugin that installs the **Three Axes Framework** — an always-active AI development philosophy that calibrates AI behavior to prevent comprehension debt while maximizing productivity.

## What it does

The framework governs every coding interaction by evaluating tasks across three independent axes:

| Axis | Question | Range |
|------|----------|-------|
| **Mastery** | How well does the developer know this domain? | Low → High |
| **Consequence** | What breaks if something goes wrong? | Low → High |
| **Intent** | Optimizing for output or growth? | Output → Growth |

Based on where a task sits on these axes, the AI adjusts its six core principles — from full mentor mode (low mastery, growth intent) to efficient pair-programmer mode (high mastery, output intent).

Alongside the principles run thirteen **Integrity Rules** — numbered, citable constraints that close the failure modes which erode trust in AI-assisted work: silent scope creep, confident guessing, guess-patch loops, self-certification, and reflexive agreement.

**Core insight:** The tool doesn't destroy understanding. Passive delegation does.

## Installation

### Via the lux-solari-plugins marketplace (recommended)

```bash
# 1. Add the marketplace (one-time)
claude plugin marketplace add luxsolari/lux-solari-plugins

# 2. Install the plugin
claude plugin install three-axes-framework@lux-solari-plugins
```

Or from inside Claude Code:

```
/plugin marketplace add luxsolari/lux-solari-plugins
/plugin install three-axes-framework@lux-solari-plugins
```

### Local development / testing

```bash
git clone https://github.com/luxsolari/three-axes-framework
claude plugin validate ./three-axes-framework   # verify structure
claude --plugin-dir ./three-axes-framework      # load it for a real session, no install needed
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor workflow.

## Quickstart

```bash
# 1. Install
claude plugin marketplace add luxsolari/lux-solari-plugins
claude plugin install three-axes-framework@lux-solari-plugins

# 2. Configure your profile (run once)
/three-axes-setup

# 3. Check what's active at any time
/three-axes-status
```

If you start work before configuring a profile, the assistant guides you through setup in chat: choose global or project scope and the three axis values. Project tool calls stay blocked until the profile is saved, then work can resume.

**Need a quick mode change?** Use presets for the current session:

```bash
/three-axes-mode learning     # exploring something new
/three-axes-mode production   # high-stakes work
/three-axes-mode output       # just ship it
```

Or tell Claude directly: *"Walk me through this"*, *"Let me try this"*, *"Just do it"*.

---

## How it works

Once installed, the framework is **truly always active** via a `SessionStart` hook that fires on every session startup, resume, clear, and compact event. The hook injects the full framework into Claude's context before any conversation begins — no slash command, no keyword trigger, no manual invocation needed.

A `UserPromptSubmit` hook checks persistent configuration on every turn. If
neither the user-level nor project-level profile is valid, it directs the
assistant into guided setup. A `PreToolUse` hook denies tool calls except setup
questions and the dedicated profile writer until a valid baseline is saved.
This keeps chat available for onboarding while preventing project tool use.
The hooks must be enabled and trusted by the host; this is a workflow guardrail,
not a security boundary over tool paths the host does not expose to hooks.

A companion skill also loads contextually whenever conversations involve coding, architecture, debugging, or design — providing a second activation path as a fallback.

> **Context window cost:** The hook injects approximately **~3,550 tokens** per session (the framework rules, the Integrity Rules, and your active profile). This is a one-time cost paid at session start — it does not grow during the conversation. That is up from ~2,400 in 1.2.1; the Integrity Rules, precedence notes and recovery signals account for the difference. On a 200k-token context window it is roughly 1.7% overhead.
>
> Both figures are estimated from the hook's actual output payload at ~4 characters per token — the same method used for the 1.2.1 number, so the two are comparable. Claude's real tokenizer will differ somewhat, and markdown tables and backticked identifiers tokenize denser than the average, so treat these as a floor rather than a precise count.

The framework operates as a background behavioral ruleset that shapes every development conversation:

- AI presents plans before implementing non-trivial changes
- AI calibrates explanation depth to your mastery level
- AI flags comprehension debt accumulation
- AI steps aside when you want to write code yourself
- AI enforces readable-over-clever as a universal standard
- AI holds to the Integrity Rules, and cites them by ID when one is broken

## The Integrity Rules

The six principles govern how much the AI does. The thirteen Integrity Rules govern how honestly it does it — and each has an ID, so both sides of the conversation can point at a specific rule instead of arguing about vibes.

| ID | Rule |
|---|---|
| IR-01 | Certification belongs to the developer — the AI never calls its own output working, fixed, complete or production-ready |
| IR-02 | Diagnose before patching — a bug report gets root-cause analysis first, not a guessed fix |
| IR-03 | Declare missing data — `INSUFFICIENT DATA` instead of a plausible invention |
| IR-04 | Stay inside the requested scope — unrequested refactors get proposed, not performed |
| IR-05 | Deliver whole — no elisions, no fragments to splice |
| IR-06 | Break failure loops — the same approach is not tried twice against the same failure |
| IR-07 | Preserve what you did not write — comments and docs are content, never pruned as a side effect |
| IR-08 | Close with a status — what changed, what was verified, what is still broken |
| IR-09 | Own the error — your mistake is never the developer's prompt's fault |
| IR-10 | Stop means stop — abandon the work, report what was already changed, wait |
| IR-11 | Pressure slows you down — urgency is a signal to verify, not to hurry |
| IR-12 | Correct without ceremony — one acknowledgement, the fix, no apology loops |
| IR-13 | Agreement is earned — reflexive agreement hides the moment a wrong assumption should have been corrected |

Every rule holds at every setting; what scales is the ceremony each one carries. In production (**Consequence** high), IR-02's root cause and IR-08's status are written down; on a throwaway script one line each will do. At low **Mastery**, IR-03, IR-09 and IR-13 matter most — those are the failures a developer still building intuition cannot catch on their own.

A mode-switch signal moves the axes; it does not suspend the rules. "Just ship it" buys terseness, not a guessed fix.

When a rule gets broken, `/three-axes-audit` is the recovery path.

## Mode-switch signals

You can explicitly shift AI behavior mid-conversation:

| Say | Mode | Effect |
|-----|------|--------|
| "Let me try this" | **Mentor** | AI steps aside, reviews on request |
| "Just do it" / "Ship it" | **Output** | AI is efficient, minimal ceremony |
| "Walk me through this" | **Growth** | AI teaches thoroughly, explains tradeoffs |
| "What are the tradeoffs?" | **Design** | AI presents alternatives, no default recommendation |

## Three-tier profile system

The framework operates across three tiers. Each tier has narrower scope and higher priority:

```
Tier 1 — Persistent Profile         ~/.claude/three-axes-profile.json (global)
                                     .three-axes.json (project root, committable)
         ↓ overridden by
Tier 2 — Session Commands            ~/.claude/three-axes-session.json
         written by /three-axes-mode and /three-axes-set
         cleared on session start, preserved across compact/resume
         ↓ overridden by
Tier 3 — Conversational Signals      natural language, no files written, task-scoped
```

**Tier 3 mode-switch signals:**

| Say | Mode | Effect | Duration |
|---|---|---|---|
| "Let me try this" | Mentor | AI steps aside, reviews on request | Until attempt completes |
| "Just do it" | Output | Efficient, minimal ceremony | Single task |
| "Walk me through this" | Growth | AI teaches thoroughly | Until topic closes |
| "What are the tradeoffs?" | Design | AI presents alternatives, no recommendation | Single response |

---

## Commands

### `/three-axes-setup`
Interactive first-run setup. Asks about each axis and writes your profile to `~/.claude/three-axes-profile.json`. Run this once after installation, or let the first-run hook guide you through global/project setup when you begin work. Unconfigured sessions remain in setup until a valid persistent profile is saved.

### `/three-axes-status`
Shows the resolved profile for the current session, with source label for each axis (`global`, `project`, `session`, or `default`).

```
Three Axes Framework — current session
  mastery:     high        (global)
  consequence: high        (project)
  intent:      balanced    (default)
```

### `/three-axes-mode <preset>`
Applies a named preset to the session (ephemeral — cleared on next startup).

| Preset | mastery | consequence | intent |
|---|---|---|---|
| `learning` | low | low | growth |
| `output` | high | medium | output |
| `production` | high | high | output |
| `explore` | low | medium | growth |
| `balanced` | medium | medium | balanced |

### `/three-axes-set <axis>=<value> [--project|--global]`
Sets individual axis values. Default scope is session.

```bash
/three-axes-set mastery=high                    # session (ephemeral)
/three-axes-set consequence=high --project      # writes .three-axes.json
/three-axes-set intent=growth --global          # writes ~/.claude/three-axes-profile.json
/three-axes-set mastery=low intent=growth       # multiple axes, session scope
```

Valid values:
- `mastery`: `low` | `medium` | `high`
- `consequence`: `low` | `medium` | `high`
- `intent`: `growth` | `balanced` | `output`

### `/three-axes-audit [what went wrong]`
The recovery path when an Integrity Rule gets broken. Invoke it the moment you notice drift — an unrequested change, a confident wrong answer, a claim that something works when it doesn't, the same failed fix offered twice.

The audit turn is constrained: **no code, no apology, no resuming the task.** Claude names the violated rule by ID with the offending output quoted, gives a mechanical account of what caused it, proposes a concrete correction, and rates the session `CLEAN`, `DEGRADED`, or `COMPROMISED`. Then it stops and waits.

```
INTEGRITY AUDIT

VIOLATED:    IR-04 — Stay inside the requested scope
             "I also renamed the helper for consistency"
CAUSE:       Adjacent cleanup treated as implied by the request; no confirmation sought.
CORRECTION:  Unrequested edits go in a proposal list at the end of the turn, never in the diff.
CONTEXT:     CLEAN — isolated slip, corrections still holding.
```

If nothing in the ruleset actually covers what went wrong, Claude is required to say so and propose a candidate rule rather than manufacture a confession. A ruleset that grows out of real failures beats one that produces guilt on demand.

### `/three-axes-handoff [output-path]`
Generates a continuity document for handing work to a fresh session — for when the context window is saturated, corrections have stopped sticking, or you're simply done for the day. With a path argument it writes the file; without one it prints to the conversation.

Beyond the usual state summary, it captures the two things handoffs almost always lose:

- **Failure log** — every approach tried and abandoned, with the reason. Without it, the next session cheerfully re-derives your dead ends.
- **Intent map** — code that looks removable but isn't: unreferenced functions, defensive branches, deliberate duplication. Stops a well-meaning cleanup from causing a regression.

It closes with an explicit caveat that the outgoing session's diagnosis is a hypothesis to verify, not a fact to build on. If the diagnosis were reliable, the handoff probably wouldn't have been needed.

### `/three-axes-log [note]`
Appends an entry for the task you just finished to `JOURNAL.md` at the repo root. IR-08 closes the loop inside the conversation; this closes it on disk.

Each entry records what changed, what was actually verified and how, what is still open, and what was tried and ruled out. The point is that the next agent to open the repo — a fresh session, a different model, a colleague — reads it instead of re-deriving the same context from the diff.

When the log passes ~40 entries it compacts: everything older than the most recent 15 folds into a one-line-per-entry historical summary. Compaction is lossy on purpose, but never drops a **decision** or a **recorded failure** — those are what stop the next session re-litigating a settled question or re-walking a dead end. Routine detail goes instead.

The command's own page carries a `CLAUDE.md` block to paste into a repo so every agent working there maintains the same log.

### `/three-axes` and `/three-axes-framework`
Bare invocation (no arguments) — either name works, so it's discoverable whether you remember the framework's short name or its full plugin name. Shows the active profile (equivalent to `/three-axes-status`) plus a quick command reference.

---

## Profile Configuration

### Profile cascade

```
1. ~/.claude/three-axes-profile.json   global default (all projects)
2. .three-axes.json                    project override (repo root, committable)
3. ~/.claude/three-axes-session.json   session override (ephemeral, auto-cleared)
```

Keys not set in a layer fall through to the layer below. A project file with only `{ "consequence": "high" }` overrides just that axis, inheriting the rest from the global profile.

### Schema

All three files share the same optional-key shape:

```json
{
  "mastery":     "low" | "medium" | "high",
  "consequence": "low" | "medium" | "high",
  "intent":      "growth" | "balanced" | "output"
}
```

**Defaults** (for omitted axes in a configured profile): `mastery=medium`, `consequence=medium`, `intent=balanced`.

A valid persistent profile is a non-empty JSON object containing only the known
axes and allowed values. Partial profiles are supported. Empty objects, invalid
values, malformed JSON, and session-only overrides do not satisfy setup. Invalid
layers are ignored during resolution. The gate rechecks files before tool calls,
so deleting the last valid persistent profile pauses work again.

### Project profiles

`.three-axes.json` is committable by default — useful for sharing team defaults. Add it to `.gitignore` if you want per-developer settings only.

## Research basis

- Shen, J.H. & Tamkin, A. (2026). *How AI Impacts Skill Formation.* Anthropic Research. [arXiv:2601.20245](https://arxiv.org/abs/2601.20245)
- Osmani, A. (2026). *Comprehension Debt.* [addyosmani.com](https://addyosmani.com/blog/comprehension-debt/)
- Storey, M.A. (2026). *Cognitive Debt.* [margaretstorey.com](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/)

### Prior art

The Integrity Rules owe their central idea — that AI failure modes should be *enumerated and given IDs* rather than gestured at with "be careful" — to Santiago Bustelo's [Perkele Protocol](https://github.com/sbustelo/AI-DevTools/tree/main/AI-PerkeleProtocols), which catalogues roughly sixty of them.

Two departures are deliberate. That protocol treats adversarial pressure — profanity, absolute-obedience framing, threat of penalty — as the enforcement mechanism; this one does not. Its own LAW_57 concedes the point, instructing the model to read anger and urgency as a trigger for *more* caution rather than more speed; that observation survives here as IR-11, and the hostility around it does not. And where that protocol demands total submission to the operator, the Three Axes Framework depends on the AI pushing back — a developer who cannot be told their architecture is wrong is accumulating a more expensive kind of debt.

---

## Troubleshooting

### Installation fails with `Permission denied (publickey)`

Claude Code's plugin installer uses SSH (`git@github.com:`) by default. If you don't have GitHub SSH keys configured — common on WSL, Docker, CI, or fresh machines — the install will fail even though this is a public repository.

**Known issue:** As of Claude Code v2.1.80, the TUI Discover screen and `claude plugin install` command both still use the SSH path, regardless of whether SSH is configured. This is tracked at [anthropics/claude-code#18001](https://github.com/anthropics/claude-code/issues/18001) — check that issue for current status before assuming this still applies.

**Fix — generate and configure SSH keys for GitHub:**

```bash
# 1. Generate a new SSH key (accept defaults, optionally add a passphrase)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. Print the public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to GitHub: **Settings → SSH and GPG keys → New SSH key**.

```bash
# 3. Verify the connection
ssh -T git@github.com
# Expected: "Hi <username>! You've successfully authenticated..."
```

Then retry the plugin installation.

**Quick workaround (no GitHub account needed) — tell git to use HTTPS instead:**

```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

This redirects all SSH clone attempts to HTTPS. Useful for WSL, Docker, or CI environments where setting up SSH keys isn't practical.

## License
MIT — free to use, fork, and adapt.
