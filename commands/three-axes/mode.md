---
description: Apply a named preset to the current session. Usage: /three-axes mode <preset>. Available presets: learning, output, production, explore, balanced.
---

Apply a named preset to the Three Axes Framework session profile.

The arguments passed to this command are: $ARGUMENTS

**Presets:**
| Preset     | mastery | consequence | intent  |
|------------|---------|-------------|---------|
| learning   | low     | low         | growth  |
| output     | high    | medium      | output  |
| production | high    | high        | output  |
| explore    | low     | medium      | growth  |
| balanced   | medium  | medium      | balanced|

Follow these steps:

0. If `$ARGUMENTS` is empty or blank, respond: 'Usage: /three-axes mode <preset>. Available presets: learning, output, production, explore, balanced' and stop.

1. Parse the preset name from: `$ARGUMENTS` (trim whitespace, lowercase).

2. If the preset is not in the table above, respond with:
   "Unknown preset: `<name>`. Available presets: learning, output, production, explore, balanced"
   and stop.

3. Look up the three axis values for the preset.

4. Write `~/.claude/three-axes-session.json` using the Write tool with this content (note: this intentionally replaces the entire session profile — presets always set all three axes):
   ```json
   {
     "mastery": "<value>",
     "consequence": "<value>",
     "intent": "<value>"
   }
   ```

5. Confirm: "Session set to **<preset>** preset (mastery: <value>, consequence: <value>, intent: <value>). This applies for the current session only and will reset on next startup. Use `/three-axes status` to verify."
