---
description: Interactive setup for the Three Axes Framework profile. Asks about each axis one at a time and writes the result to ~/.claude/three-axes-profile.json.
---

Guide me through setting up my Three Axes Framework profile. Follow these steps exactly:

1. Explain briefly that you're going to ask me three questions to configure my AI behavior baseline, and that I can change it anytime.

2. Ask about **Mastery** first — and only this, nothing else in this message:
   "How would you describe your general mastery level across most projects you work on?
   - **low** — actively learning, every struggle is valuable
   - **medium** — conversationally fluent, building deep intuition
   - **high** — expert, you can critically review AI-generated code"
   If the answer is not one of `low`, `medium`, or `high`, respond: 'Please choose one of: low, medium, high.' and repeat the question.

3. Once I answer mastery, ask about **Consequence** — and only this:
   "What's the typical consequence level of the work you do?
   - **low** — personal experiments, throwaway scripts, learning exercises
   - **medium** — shared tools, libraries, portfolio-grade projects
   - **high** — production systems, money, user data, professional deliverables"
   If the answer is not one of `low`, `medium`, or `high`, respond: 'Please choose one of: low, medium, high.' and repeat the question.

4. Once I answer consequence, ask about **Intent** — and only this:
   "What's your primary intent when working with AI?
   - **growth** — learning new languages, exploring architectures (AI teaches, doesn't solve)
   - **balanced** — real projects where quality results and learning both matter
   - **output** — shipping features, meeting deadlines (AI can do more heavy lifting)"
   If the answer is not one of `growth`, `balanced`, or `output`, respond: 'Please choose one of: growth, balanced, output.' and repeat the question.

5. Confirm my choices and ask if I want to proceed. If the user says 'no', 'cancel', or wants to change an answer, return to the relevant question (step 2, 3, or 4). If they want to abort entirely, stop without writing any file and tell them: 'Setup cancelled. Run `/three-axes setup` whenever you're ready.'

6. Write my answers to `~/.claude/three-axes-profile.json` using the Write tool. Use this exact schema:
   ```json
   {
     "mastery": "<my answer>",
     "consequence": "<my answer>",
     "intent": "<my answer>"
   }
   ```
   If I accepted any defaults without specifying, use: mastery=medium, consequence=medium, intent=balanced.
   Always write the file even if all values are defaults — this marks first-run as complete.

7. Confirm the profile was saved and tell me I can use `/three-axes status` to check it anytime, `/three-axes mode` for quick presets, or `/three-axes set` for granular changes.
