# Three Axes Framework — Commands & Profile System Design

**Date:** 2026-03-19
**Version:** 1.0.0 → 1.1.0
**Status:** Approved

---

## Problem

The Three Axes Framework currently injects a static behavioral ruleset at session start. The three axes (Mastery, Consequence, Intent) are inferred by Claude from conversation context — there is no mechanism for the user to explicitly set them, persist preferences across sessions, or override them per-project.

---

## Goals

- Allow users to define a persistent cross-project axis profile
- Allow per-project overrides (committable, shareable with teams)
- Allow per-session ephemeral overrides without touching persistent config
- Provide a frictionless first-run experience (no manual setup required to get started)
- Expose commands for status inspection, preset switching, and granular tuning

---

## Non-Goals

- Visual dashboard or UI
- Cloud sync of profiles
- Per-file or per-directory axis overrides

---

## Architecture

### Profile Cascade

Three layers are resolved in order — later layers override earlier ones on a per-key basis:

```
1. ~/.claude/three-axes-profile.json     Global default (cross-project)
2. .three-axes.json                      Project override (repo root, committable)
3. ~/.claude/three-axes-session.json     Session override (ephemeral)
```

Missing keys fall through to the next layer. A project file with only `{ "consequence": "high" }` overrides just that axis, inheriting the rest from the global profile.

### Profile Schema

All three files share the same shape. All keys are optional:

```json
{
  "mastery":     "low" | "medium" | "high",
  "consequence": "low" | "medium" | "high",
  "intent":      "growth" | "balanced" | "output"
}
```

**Defaults** (applied when no layer specifies a value):

| Axis | Default |
|---|---|
| mastery | medium |
| consequence | medium |
| intent | balanced |

---

## SessionStart Hook (Extended)

The existing `inject-framework.mjs` hook is extended to:

1. Read and merge the three profile layers into a resolved profile
2. Detect first-run: if `~/.claude/three-axes-profile.json` does not exist **and** `.three-axes.json` does not exist at the project root, inject a first-run setup prompt alongside the framework rules (Claude will initiate the setup conversation). A profile file containing `{}` (written by setup even with all-defaults) satisfies the existence check and suppresses the first-run prompt on future sessions.
3. Wipe `~/.claude/three-axes-session.json` on `startup` events only. The `resume` and `compact` events preserve the session file, keeping in-session overrides across compactions. (`startup`, `resume`, and `compact` are the event names surfaced by the Claude Code `SessionStart` hook, matching the `matcher` field in `hooks.json`.)
4. Inject the resolved axis values + framework rules as `additionalContext` (silent — no terminal output)

---

## Commands

### `/three-axes setup`

Starts an interactive conversational setup. Claude asks about each axis one at a time, explains the tradeoffs for each value, then writes the result to `~/.claude/three-axes-profile.json`. The file is always written on completion — even if the user accepts all defaults — so that the first-run trigger is not fired again.

Also triggered automatically on the first session when no global or project profile is detected.

---

### `/three-axes status`

Prints the resolved profile, showing each axis value and its source layer. Possible source labels are `global`, `project`, `session`, and `default`:

```
Three Axes Framework — current session
  mastery:     high        (global)
  consequence: high        (project)
  intent:      growth      (session)
  mastery:     medium      (default)   ← example if no layer sets it
```

A realistic single-session output:

```
Three Axes Framework — current session
  mastery:     high        (global)
  consequence: high        (project)
  intent:      balanced    (default)
```

---

### `/three-axes mode <preset>`

Applies a named preset. Writes all three axis values to the session override file, **replacing** any prior session values for those keys. Any other keys already in the session file are left untouched (though presets set all three axes, so in practice the session file is fully overwritten). The file is cleared on next `startup`.

| Preset | mastery | consequence | intent |
|---|---|---|---|
| `learning` | low | low | growth |
| `output` | high | medium | output |
| `production` | high | high | output |
| `explore` | low | medium | growth |
| `balanced` | medium | medium | balanced |

---

### `/three-axes set <axis>=<value> [--project|--global]`

Granular axis control. Default scope is session (ephemeral).

```
/three-axes set mastery=high                     → session scope
/three-axes set consequence=high --project       → writes .three-axes.json
/three-axes set intent=growth --global           → writes ~/.claude/three-axes-profile.json
```

Multiple axes can be set in one command. A scope flag applies to all axes in the command:

```
/three-axes set mastery=low intent=growth --project   → both written to .three-axes.json
```

**Validation:** All axis=value pairs are validated before any writes occur. If any value is invalid (unrecognised axis name or out-of-range value), the entire command fails with an error message and no file is modified.

**Project file location:** When `--project` is used, the target file is `.three-axes.json` at the git repository root (resolved via `git rev-parse --show-toplevel`). In non-git directories, the file is written to the current working directory. If the file does not exist, it is created.

---

## Files Changed

### New files

| File | Purpose |
|---|---|
| `CHANGELOG.md` | Keep a Changelog format. Sections: `[Unreleased]`, `[1.1.0]`, `[1.0.0]`. Each release entry uses Added / Changed / Fixed subsections. |
| `CONTRIBUTING.md` | Sections: How to report issues (GitHub Issues), How to propose changes (fork → branch → PR), Local testing (install from local directory via `claude plugin add --local`), Commit convention (Conventional Commits). Tone: concise, welcoming. |
| `LICENSE` | Standard MIT license. Author: Lux Solari. Year: 2026. |
| `docs/superpowers/specs/2026-03-19-three-axes-commands-design.md` | This document |

### Updated files

| File | Change |
|---|---|
| `.claude-plugin/plugin.json` | Version bump `1.0.0 → 1.1.0` |
| `README.md` | Add "Commands" section (all four commands with examples) and "Profile Configuration" section (cascade diagram, file locations, schema) |
| `hooks/inject-framework.mjs` | Extend with profile cascade reading, first-run detection, and session file wiping on `startup` |
| `skills/three-axes-framework/SKILL.md` | Document that axis values can be explicitly set via commands; link to command reference |

### New runtime files (not in repo)

| File | Purpose |
|---|---|
| `~/.claude/three-axes-profile.json` | Global profile, created by `/three-axes setup` |
| `~/.claude/three-axes-session.json` | Ephemeral session override, wiped on startup |

---

## Versioning

This is a **minor** version bump (`1.1.0`) — additive features only, no breaking changes to existing hook behavior. The framework continues to work identically for users who never run any commands.

Commit message convention: Conventional Commits (already used in repo history).

---

## Marketplace Update

After the implementation is merged and tagged `v1.1.0`, the marketplace entry is updated by:

1. Bumping the version in `.claude-plugin/plugin.json` to `1.1.0`
2. Pushing the tag: `git tag v1.1.0 && git push origin v1.1.0`
3. The marketplace (Lux Solari Plugins registry) picks up the new tag automatically if configured for tag-based releases — or requires a manual registry update depending on how the marketplace source is configured

> This should be confirmed against the marketplace's release workflow before tagging.

---

## Open Questions

- Should `.three-axes.json` be added to a `.gitignore` template, or is it intentionally committable (to share team defaults)? → **Decision: committable by default.** Teams may want to share project-level defaults.
- Should session overrides survive `compact` events? → **Decision: yes.** Wiped only on `startup`.
