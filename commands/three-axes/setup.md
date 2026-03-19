---
description: Interactive setup for the Three Axes Framework profile. Asks about each axis one at a time and writes the result to ~/.claude/three-axes-profile.json.
---

Guide me through setting up my Three Axes Framework profile. Follow these steps exactly:

1. Say in one sentence: "I'll ask you three quick questions to set your AI behavior baseline — you can change it anytime."

2. Use the `AskUserQuestion` tool with exactly these three questions in a single call:

   Question 1:
   - question: "How would you describe your general mastery level across most projects?"
   - header: "Mastery"
   - multiSelect: false
   - options:
     - label: "Low", description: "Actively learning — every struggle is valuable, AI mentors rather than solves"
     - label: "Medium (Recommended)", description: "Conversationally fluent — building deeper intuition, AI explains more"
     - label: "High", description: "Expert — you can critically review AI-generated code, AI accelerates you"

   Question 2:
   - question: "What's the typical consequence level of the work you do?"
   - header: "Consequence"
   - multiSelect: false
   - options:
     - label: "Low", description: "Personal experiments, throwaway scripts, learning exercises"
     - label: "Medium (Recommended)", description: "Shared tools, libraries, portfolio-grade projects"
     - label: "High", description: "Production systems, money, user data, professional deliverables"

   Question 3:
   - question: "What's your primary intent when working with AI?"
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

5. Confirm with one sentence: "Profile saved — use `/three-axes status` to review, `/three-axes mode` for quick presets, or `/three-axes set` for granular changes."
