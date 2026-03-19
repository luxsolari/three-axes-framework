---
description: Shows the currently resolved Three Axes Framework profile, with source layer for each axis value.
---

Display the current Three Axes Framework profile. Follow these steps:

1. Read these files using the Read tool (treat missing files as empty `{}`):
   - Global profile: `~/.claude/three-axes-profile.json`
   - Project profile: `.three-axes.json` (in the current working directory — check if we're in a git repo first with `git rev-parse --show-toplevel` via Bash, use that root if available)
   - Session profile: `~/.claude/three-axes-session.json`

2. Resolve the merged profile using this priority order (last wins per key):
   defaults → global → project → session

   Defaults: mastery=medium, consequence=medium, intent=balanced

3. For each axis, track the source: `global`, `project`, `session`, or `default`.

4. Display the result in this exact format:
   ```
   Three Axes Framework — current session
     mastery:     <value>   (<source>)
     consequence: <value>   (<source>)
     intent:      <value>   (<source>)
   ```

5. If `~/.claude/three-axes-session.json` exists, add a note: "Session overrides are active. They will be cleared on next session start."

6. If no profile files exist at all, add a note: "No profile configured. Run `/three-axes setup` to set your baseline."
