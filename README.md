# Three Axes Framework

A Claude Code plugin that installs the **Three Axes Framework** — an always-active AI development philosophy that calibrates AI behavior to prevent comprehension debt while maximizing productivity.

## What it does

The framework governs every coding interaction by evaluating tasks across three independent axes:

| Axis | Question | Range |
|------|----------|-------|
| **Mastery** | How well does the developer know this domain? | Low → High |
| **Consequence** | What breaks if something goes wrong? | Low → High |
| **Intent** | Optimizing for output or growth? | Output → Growth |

Based on where a task sits on these axes, the AI adjusts its six core principles — from full mentor mode (low mastery, growth intent) to efficient pair-programmer mode (high mastery, output intent).

**Core insight:** The tool doesn't destroy understanding. Passive delegation does.

## Installation

### Via the lux-solari-plugins marketplace (recommended)

```bash
# 1. Add the marketplace (one-time)
claude plugins marketplace add luxsolari/lux-solari-plugins

# 2. Install the plugin
claude plugins install three-axes-framework@lux-solari-plugins
```

Or from inside Claude Code:

```
/plugin marketplace add luxsolari/lux-solari-plugins
/plugin install three-axes-framework@lux-solari-plugins
```

### Direct GitHub install (no marketplace)

```bash
claude plugins install three-axes-framework@github:luxsolari/three-axes-framework
```

### Local development / testing

```bash
git clone https://github.com/luxsolari/three-axes-framework
claude plugin validate ./three-axes-framework
```

## How it works

Once installed, the framework is **truly always active** via a `SessionStart` hook that fires on every session startup, resume, clear, and compact event. The hook injects the full framework into Claude's context before any conversation begins — no slash command, no keyword trigger, no manual invocation needed.

A companion skill also loads contextually whenever conversations involve coding, architecture, debugging, or design — providing a second activation path as a fallback.

The framework operates as a background behavioral ruleset that shapes every development conversation:

- AI presents plans before implementing non-trivial changes
- AI calibrates explanation depth to your mastery level
- AI flags comprehension debt accumulation
- AI steps aside when you want to write code yourself
- AI enforces readable-over-clever as a universal standard

## Mode-switch signals

You can explicitly shift AI behavior mid-conversation:

| Say | Mode | Effect |
|-----|------|--------|
| "Let me try this" | **Mentor** | AI steps aside, reviews on request |
| "Just do it" / "Ship it" | **Output** | AI is efficient, minimal ceremony |
| "Walk me through this" | **Growth** | AI teaches thoroughly, explains tradeoffs |
| "What are the tradeoffs?" | **Design** | AI presents alternatives, no default recommendation |

## Research basis

- Shen, J.H. & Tamkin, A. (2026). *How AI Impacts Skill Formation.* Anthropic Research. [arXiv:2601.20245](https://arxiv.org/abs/2601.20245)
- Osmani, A. (2026). *Comprehension Debt.* [addyosmani.com](https://addyosmani.com/blog/comprehension-debt/)
- Storey, M.A. (2026). *Cognitive Debt.* [margaretstorey.com](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/)

## License

MIT — free to use, fork, and adapt.

## Author

**Lux Solari** — [luxsolari@outlook.com](mailto:luxsolari@outlook.com)

## How it works

The framework operates across three tiers. Each tier has narrower scope and higher priority:

```
Tier 1 — Persistent Profile         ~/.claude/three-axes-profile.json (global)
                                     .three-axes.json (project root, committable)
         ↓ overridden by
Tier 2 — Session Commands            ~/.claude/three-axes-session.json
         written by /three-axes mode and /three-axes set
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

### `/three-axes setup`
Interactive first-run setup. Asks about each axis and writes your profile to `~/.claude/three-axes-profile.json`. Also triggered automatically on first session if no profile exists.

### `/three-axes status`
Shows the resolved profile for the current session, with source label for each axis (`global`, `project`, `session`, or `default`).

```
Three Axes Framework — current session
  mastery:     high        (global)
  consequence: high        (project)
  intent:      balanced    (default)
```

### `/three-axes mode <preset>`
Applies a named preset to the session (ephemeral — cleared on next startup).

| Preset | mastery | consequence | intent |
|---|---|---|---|
| `learning` | low | low | growth |
| `output` | high | medium | output |
| `production` | high | high | output |
| `explore` | low | medium | growth |
| `balanced` | medium | medium | balanced |

### `/three-axes set <axis>=<value> [--project|--global]`
Sets individual axis values. Default scope is session.

```bash
/three-axes set mastery=high                    # session (ephemeral)
/three-axes set consequence=high --project      # writes .three-axes.json
/three-axes set intent=growth --global          # writes ~/.claude/three-axes-profile.json
/three-axes set mastery=low intent=growth       # multiple axes, session scope
```

Valid values:
- `mastery`: `low` | `medium` | `high`
- `consequence`: `low` | `medium` | `high`
- `intent`: `growth` | `balanced` | `output`

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

**Defaults** (when no layer specifies a value): `mastery=medium`, `consequence=medium`, `intent=balanced`.

### Project profiles

`.three-axes.json` is committable by default — useful for sharing team defaults. Add it to `.gitignore` if you want per-developer settings only.
