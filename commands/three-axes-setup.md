---
description: Interactive setup for the Three Axes Framework profile. Asks about each axis one at a time and writes the result to ~/.claude/three-axes-profile.json.
---

Guide me through setting up my Three Axes Framework profile.

If the hook reports that the first-run setup gate is active, follow its guided
setup instructions first: ask for global or project scope and the three values,
then run its exact profile-writer command. Workspace-affecting tools remain
blocked until setup is saved; conversation and non-workspace tools remain
available. Use the six-principle confirmation below after saving. Otherwise,
follow these steps to reconfigure the global profile:

1. Say in one sentence: "I'll ask three quick questions to set the fallback behavior I should use when no project profile overrides it — this describes how I assist, not your ability at every task."

2. Use the `AskUserQuestion` tool with exactly these three questions in a single call:

   Question 1:
   - question: "When no project profile exists, how much prior understanding should I assume?"
   - header: "Mastery"
   - multiSelect: false
   - options:
     - label: "Low", description: "Assume I am learning this area; teach and leave room for me to try"
     - label: "Medium (Recommended)", description: "Assume working familiarity; explain non-obvious decisions"
     - label: "High", description: "Assume I can critically review the work; keep explanations concise"

   Question 2:
   - question: "When no project profile exists, what risk level should I assume?"
   - header: "Consequence"
   - multiSelect: false
   - options:
     - label: "Low", description: "A mistake is cheap to discard or undo"
     - label: "Medium (Recommended)", description: "The work is maintained, shared, or portfolio-grade"
     - label: "High", description: "Failure could affect production, money, user data, or professional delivery"

   Question 3:
   - question: "By default, what should assistance optimize for?"
   - header: "Intent"
   - multiSelect: false
   - options:
     - label: "Growth", description: "Learning new languages, exploring architectures — AI teaches, doesn't solve"
     - label: "Balanced (Recommended)", description: "Real projects where quality results and learning both matter"
     - label: "Output", description: "Shipping features, meeting deadlines — AI can do more heavy lifting"

3. Map the selected labels to profile values:
   - Mastery: "Low" → `low`, "Medium (Recommended)" → `medium`, "High" → `high`
   - Consequence: "Low" → `low`, "Medium (Recommended)" → `medium`, "High" → `high`
   - Intent: "Growth" → `growth`, "Balanced (Recommended)" → `balanced`, "Output" → `output`
   - If the user selected "Other" and typed a custom value, validate it against the allowed values above. If invalid, ask them to clarify.

4. Write the answers to `~/.claude/three-axes-profile.json` using the Write tool:
   ```json
   {
     "mastery": "<mapped value>",
     "consequence": "<mapped value>",
     "intent": "<mapped value>"
   }
   ```
   Always write the file even if all values are defaults — this marks first-run as complete.

5. Output the following confirmation. Replace each `<…>` placeholder with a concrete one-sentence description of how that principle applies given the user's specific mastery/consequence/intent values. Do not skip, reorder, or merge any principle — all six must appear.

   ---
   Profile saved to `~/.claude/three-axes-profile.json`.

   **How this shapes our work together:**

   | Principle | Behavior at your profile |
   |---|---|
   | Own the SDLC | <how architectural ownership applies at this mastery+consequence level> |
   | Explain before building | <how much upfront explanation to expect at this mastery+intent level> |
   | No black boxes | <how comprehension debt is flagged at this mastery+consequence level> |
   | Phases ship working software | <what "working" means at this consequence level — e.g. full tests vs. compiles and runs> |
   | Leave room to code | <how much the AI steps aside vs. leads at this mastery+intent level> |
   | Readable over clever | <how strictly clarity is enforced at this mastery level> |

   **Adjusting your profile:**

   Your profile is a baseline, not a constraint — you have three ways to shift AI behavior at any time:

   - **Presets** (session-wide): `/three-axes-mode learning`, `production`, `output`, `explore`, or `balanced`
   - **Granular** (persistent or session): `/three-axes-set mastery=high`, `consequence=low --project`, `intent=growth --global`, etc.
   - **Conversational signals** (task-scoped, no commands needed): say things like *"walk me through this"*, *"let me try this"*, *"just do it"*, or *"what are the tradeoffs?"* — these shift behavior for that task only, then revert automatically.

   Run `/three-axes-status` at any time to see the active profile and where each value comes from.
   ---
