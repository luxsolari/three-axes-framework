---
description: Set individual axis values. Usage: /three-axes set <axis>=<value> [--project|--global]. Default scope is session. Multiple axes can be set in one command.
---

Set one or more Three Axes Framework axis values.

The arguments passed to this command are: $ARGUMENTS

**Valid axes and values:**
- `mastery`: low, medium, high
- `consequence`: low, medium, high
- `intent`: growth, balanced, output

**Scope flags:** `--project` (writes `.three-axes.json` at repo root), `--global` (writes `~/.claude/three-axes-profile.json`). Default (no flag): session only (`~/.claude/three-axes-session.json`).

Follow these steps:

1. Parse `$ARGUMENTS`:
   - Extract scope flag: `--project`, `--global`, or none (session).
   - Extract all `axis=value` pairs (split on spaces, filter those containing `=`).
   - If no axis=value pairs found, respond: "Usage: /three-axes set <axis>=<value> [--project|--global]" and stop.

2. **Validate all pairs before writing anything:**
   - Check each axis name is one of: mastery, consequence, intent.
   - Check each value is valid for that axis.
   - If ANY validation fails, list ALL errors and stop. Do not write any files.

3. Determine target file path:
   - `--global`: `~/.claude/three-axes-profile.json`
   - `--project`: `.three-axes.json` at git repo root. Run `git rev-parse --show-toplevel` via Bash to find the root. If not a git repo, use the current working directory. The file will be created if it doesn't exist.
   - (default): `~/.claude/three-axes-session.json`

4. Read the existing target file (treat missing as `{}`). From the existing content, keep only the three known axis keys (`mastery`, `consequence`, `intent`) — discard any unknown keys. Merge the new values in. Write the result using the Write tool.

5. Confirm: "Set <axis>=<value> [, <axis>=<value>...] in <scope> profile." where scope is `session`, `project`, or `global`.
   Add: "Use `/three-axes status` to see the full resolved profile."
