---
description: Shows the active Three Axes Framework profile and available commands. Alias for /three-axes with no arguments.
---

Show the current Three Axes Framework state and available commands. Do the following:

1. Run `/three-axes-status` to display the active profile with source labels.

2. Then output this command reference exactly as shown:

   ---
   **Available commands:**

   | Command | Description |
   |---|---|
   | `/three-axes-setup` | Interactive first-run setup — configure your axis baseline |
   | `/three-axes-status` | Show the active profile and where each value comes from |
   | `/three-axes-mode <preset>` | Apply a named preset for the session (`learning`, `output`, `production`, `explore`, `balanced`) |
   | `/three-axes-set <axis>=<value>` | Set individual axes — add `--project` or `--global` to persist beyond the session |
   | `/three-axes-audit [what went wrong]` | Stop and audit a failure — names the violated Integrity Rule by ID. No code, no apology |
   | `/three-axes-handoff [path]` | Continuity document for a fresh session — state, failure log, intent map, open questions |
   | `/three-axes-log [note]` | Append a completed-task entry to the repo's `BITACORA.md` work log |

   **Conversational signals** (no command needed, task-scoped):
   *"Walk me through this"* · *"Let me try this"* · *"Just do it"* · *"What are the tradeoffs?"*
   ---
