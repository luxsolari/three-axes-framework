#!/usr/bin/env node
import { activeProfile, hasPersistentProfile } from './lib/profile.mjs';
import { isSetupCommand, setupContext } from './lib/setup.mjs';

try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  const cwd = input.cwd || process.cwd();
  if (hasPersistentProfile(cwd)) {
    if (input.hook_event_name === 'UserPromptSubmit') {
      const { values, sources } = activeProfile(cwd);
      const profile = Object.entries(values).map(([axis, value]) => `${axis}: ${value} (${sources[axis]})`).join('\n');
      process.stdout.write(`${JSON.stringify({ hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `Three Axes persistent profile configured. Setup gate is open; any earlier setup requirement is satisfied.\n${profile}`,
      } })}\n`);
    }
  } else {
    let output;
    if (input.hook_event_name === 'UserPromptSubmit') {
      output = { hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit', additionalContext: setupContext(cwd),
      } };
    } else if (input.hook_event_name === 'PreToolUse') {
      const questionTools = ['AskUserQuestion', 'request_user_input', 'request_user_input_async'];
      const isQuestion = questionTools.includes(input.tool_name);
      const isWriter = input.tool_name === 'Bash'
        && isSetupCommand(input.tool_input?.command, cwd);
      if (!isQuestion && !isWriter) {
        output = { hookSpecificOutput: {
          hookEventName: 'PreToolUse', permissionDecision: 'deny',
          permissionDecisionReason: setupContext(cwd),
        } };
      }
    } else {
      throw new Error('Unsupported profile-gate event.');
    }
    if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
  }
} catch (error) {
  // Both registered events interpret exit 2 as a blocking error.
  process.stderr.write(`Three Axes profile check failed: ${error.message}\n`);
  process.exitCode = 2;
}
