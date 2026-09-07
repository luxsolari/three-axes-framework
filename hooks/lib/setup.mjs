import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { persistentProfilePaths, validateProfile } from './profile.mjs';

const writer = resolve(dirname(fileURLToPath(import.meta.url)), '../configure-profile.mjs');
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

export function setupCommand(target, values) {
  return `node ${quote(writer)} ${quote(target)} mastery=${values.mastery} consequence=${values.consequence} intent=${values.intent}`;
}

export function isSetupCommand(command, cwd) {
  if (typeof command !== 'string') return false;
  const match = command.match(/ mastery=(low|medium|high) consequence=(low|medium|high) intent=(growth|balanced|output)$/);
  if (!match) return false;
  const values = { mastery: match[1], consequence: match[2], intent: match[3] };
  return Object.values(persistentProfilePaths(cwd))
    .some((target) => command === setupCommand(target, values));
}

export function setupContext(cwd) {
  const paths = persistentProfilePaths(cwd);
  const example = { mastery: 'medium', consequence: 'medium', intent: 'balanced' };
  return `## Three Axes setup required

No valid persistent user-level or project-level profile exists. Pause the requested
work and guide the user through setup in this chat. Do not answer or carry out the
original task yet. Only setup questions and the profile writer are permitted.

Start onboarding automatically on this very turn, even when the user only asked
for ordinary work such as creating hello.txt. The missing profile is the trigger;
do not wait for a setup command, permission to begin onboarding, or a request to
use the interactive tool. If a question tool is available, your first action must
be calling it for the first unanswered choice below. Do not end the turn with a
text-only setup invitation. After each submitted answer, immediately ask the next
unanswered choice; after all choices are submitted, save and resume the original
request without requiring the user to repeat it.

Collect the baseline with native interactive option pickers, one question at a
time. Do not print a questionnaire or substitute a Markdown list when an
interactive question tool is available.

Use AskUserQuestion with one question per call, a short header, multiSelect=false,
and options containing label and description.

Ask only for choices the user has not already explicitly supplied:
1. Scope — Where should this baseline apply?
   - Project: This repository only. Save as project scope.
   - Global: All projects for this user. Save as global scope.
2. Mastery — How familiar are you with this work?
   - Low: Learning the domain; guide and teach.
   - Medium: Familiar, but still building deeper understanding.
   - High: Experienced; provide concise assistance.
3. Consequence — What is the impact of a mistake?
   - Low: Experiments or disposable work.
   - Medium: Shared tools or maintained projects.
   - High: Production, user data, or other costly failures.
4. Intent — What should assistance prioritize?
   - Growth: Learning and hands-on practice.
   - Balanced: Both understanding and delivery.
   - Output: Delivering the requested result efficiently.

Map the selected labels to lowercase profile values. Follow the question tool's
schema and host requirements for option ordering and recommendations. A
preselected option is not an answer: wait for the user to submit each choice.
Never silently choose a scope or accept defaults for them. If no interactive
question tool is available, explain that limitation briefly and ask only the
next question in chat; do not dump all four questions at once. If the user
declines, keep work paused. A session-only profile does not unlock work.

Once the user has chosen the scope and all three values, run the corresponding
shell command below, replacing ONLY the three axis values with their choices:

Global: ${setupCommand(paths.global, example)}
Project: ${setupCommand(paths.project, example)}

These are literal shell commands; do not wrap, chain, or change them. The writer
validates and saves the profile. If it fails, report the error and remain in setup.
After it succeeds, the tool gate rechecks the saved profile and normal work may
resume. Acknowledge the selected baseline and return to the original request.
Do not read plugin files or run other tools to perform setup.`;
}

export function validateSetupValues(args) {
  if (args.length !== 3) throw new Error('Provide mastery, consequence, and intent.');
  const values = {};
  for (const arg of args) {
    const pair = arg.split('=');
    if (pair.length !== 2 || Object.hasOwn(values, pair[0])) throw new Error('Invalid or duplicate axis.');
    values[pair[0]] = pair[1];
  }
  const errors = validateProfile(values);
  if (errors.length) throw new Error(errors.join('\n'));
  return values;
}
