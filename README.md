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
