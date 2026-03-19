# Three Axes Framework v1.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-tier profile system (persistent profile → session commands → conversational signals) with four slash commands, first-run detection, and full documentation.

**Architecture:** Extend `inject-framework.mjs` to read a JSON profile cascade (global → project → session) and inject resolved axis values alongside framework rules. Four slash commands (`setup`, `status`, `mode`, `set`) handle profile mutation. Tier-3 conversational signals remain in SKILL.md as behavioral rules with explicit axis mappings and duration semantics.

**Tech Stack:** Node.js ESM (`node:fs`, `node:os`, `node:path`, `node:child_process`), Node.js built-in test runner (`node:test`), Claude Code plugin commands (markdown), JSON profiles.

**Spec:** `docs/superpowers/specs/2026-03-19-three-axes-commands-design.md`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `hooks/lib/profile.mjs` | Profile read/merge/write/validate utilities |
| Create | `hooks/lib/__tests__/profile.test.mjs` | Unit tests for profile utilities |
| Modify | `hooks/inject-framework.mjs` | Extend with profile cascade, first-run, session wipe |
| Create | `commands/three-axes/setup.md` | `/three-axes setup` command |
| Create | `commands/three-axes/status.md` | `/three-axes status` command |
| Create | `commands/three-axes/mode.md` | `/three-axes mode` command |
| Create | `commands/three-axes/set.md` | `/three-axes set` command |
| Modify | `.claude-plugin/plugin.json` | Version bump + declare commands directory |
| Modify | `skills/three-axes-framework/SKILL.md` | Add Interaction Model section |
| Modify | `README.md` | Add How it Works, Commands, Profile Configuration sections |
| Create | `CHANGELOG.md` | Keep a Changelog format, 1.0.0 + 1.1.0 entries |
| Create | `CONTRIBUTING.md` | Issue reporting, PR workflow, local testing, commit conventions |
| Create | `LICENSE` | MIT, Lux Solari, 2026 |

---

## Task 1: Profile utility module (TDD)

**Files:**
- Create: `hooks/lib/profile.mjs`
- Create: `hooks/lib/__tests__/profile.test.mjs`

- [ ] **Step 1.0: Create required directories**

```bash
mkdir -p C:/Users/luxsolari/three-axes-framework/hooks/lib/__tests__
```

Expected: directories created, no error.

- [ ] **Step 1.1: Create the test file**

```javascript
// hooks/lib/__tests__/profile.test.mjs
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  readProfile,
  mergeProfiles,
  resolveProfile,
  writeProfile,
  validateProfile,
  isFirstRun,
  DEFAULTS,
  VALID_AXES,
} from '../profile.mjs';

const TMP = join(tmpdir(), 'three-axes-test-' + Date.now());

before(() => mkdirSync(TMP, { recursive: true }));
after(() => rmSync(TMP, { recursive: true, force: true }));

describe('readProfile', () => {
  it('returns {} for missing file', () => {
    assert.deepEqual(readProfile(join(TMP, 'nonexistent.json')), {});
  });

  it('returns {} for malformed JSON', () => {
    const p = join(TMP, 'bad.json');
    writeFileSync(p, 'not json');
    assert.deepEqual(readProfile(p), {});
  });

  it('returns parsed object for valid file', () => {
    const p = join(TMP, 'valid.json');
    writeFileSync(p, JSON.stringify({ mastery: 'high' }));
    assert.deepEqual(readProfile(p), { mastery: 'high' });
  });
});

describe('mergeProfiles', () => {
  it('later profiles win on conflict', () => {
    const result = mergeProfiles({ mastery: 'low' }, { mastery: 'high' });
    assert.equal(result.mastery, 'high');
  });

  it('missing keys fall through from earlier profiles', () => {
    const result = mergeProfiles({ mastery: 'low', intent: 'growth' }, { mastery: 'high' });
    assert.equal(result.intent, 'growth');
  });

  it('returns empty object with no arguments', () => {
    assert.deepEqual(mergeProfiles(), {});
  });
});

describe('resolveProfile', () => {
  it('applies defaults when all files are missing', () => {
    const { values, sources } = resolveProfile(
      join(TMP, 'missing1.json'),
      join(TMP, 'missing2.json'),
      join(TMP, 'missing3.json'),
    );
    assert.deepEqual(values, DEFAULTS);
    assert.equal(sources.mastery, 'default');
    assert.equal(sources.consequence, 'default');
    assert.equal(sources.intent, 'default');
  });

  it('global overrides defaults', () => {
    const g = join(TMP, 'global.json');
    writeFileSync(g, JSON.stringify({ mastery: 'high' }));
    const { values, sources } = resolveProfile(g, join(TMP, 'np.json'), join(TMP, 'ns.json'));
    assert.equal(values.mastery, 'high');
    assert.equal(sources.mastery, 'global');
    assert.equal(sources.consequence, 'default');
  });

  it('project overrides global', () => {
    const g = join(TMP, 'g2.json');
    const p = join(TMP, 'p2.json');
    writeFileSync(g, JSON.stringify({ mastery: 'low' }));
    writeFileSync(p, JSON.stringify({ mastery: 'high' }));
    const { values, sources } = resolveProfile(g, p, join(TMP, 'ns2.json'));
    assert.equal(values.mastery, 'high');
    assert.equal(sources.mastery, 'project');
  });

  it('session overrides project', () => {
    const g = join(TMP, 'g3.json');
    const p = join(TMP, 'p3.json');
    const s = join(TMP, 's3.json');
    writeFileSync(g, JSON.stringify({ mastery: 'low' }));
    writeFileSync(p, JSON.stringify({ mastery: 'medium' }));
    writeFileSync(s, JSON.stringify({ mastery: 'high' }));
    const { values, sources } = resolveProfile(g, p, s);
    assert.equal(values.mastery, 'high');
    assert.equal(sources.mastery, 'session');
  });
});

describe('writeProfile', () => {
  it('writes valid JSON to file', () => {
    const p = join(TMP, 'write-test.json');
    writeProfile(p, { mastery: 'high' });
    assert.deepEqual(readProfile(p), { mastery: 'high' });
  });
});

describe('validateProfile', () => {
  it('returns no errors for valid profile', () => {
    assert.deepEqual(validateProfile({ mastery: 'high', consequence: 'low', intent: 'growth' }), []);
  });

  it('returns error for unknown axis', () => {
    const errors = validateProfile({ unknown: 'high' });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /Unknown axis/);
  });

  it('returns error for invalid value', () => {
    const errors = validateProfile({ mastery: 'extreme' });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /Invalid value/);
  });

  it('reports all errors at once', () => {
    const errors = validateProfile({ mastery: 'extreme', unknown: 'foo' });
    assert.equal(errors.length, 2);
  });
});

describe('isFirstRun', () => {
  it('returns true when both files missing', () => {
    assert.equal(isFirstRun(join(TMP, 'x.json'), join(TMP, 'y.json')), true);
  });

  it('returns false when global exists', () => {
    const g = join(TMP, 'fr-global.json');
    writeFileSync(g, '{}');
    assert.equal(isFirstRun(g, join(TMP, 'fr-proj.json')), false);
  });

  it('returns false when project exists', () => {
    const p = join(TMP, 'fr-proj2.json');
    writeFileSync(p, '{}');
    assert.equal(isFirstRun(join(TMP, 'fr-global2.json'), p), false);
  });
});
```

- [ ] **Step 1.2: Run tests — verify they all fail**

```bash
cd C:/Users/luxsolari/three-axes-framework
node --test hooks/lib/__tests__/profile.test.mjs
```

Expected: `MODULE_NOT_FOUND` or similar — `profile.mjs` does not exist yet.

- [ ] **Step 1.3: Create `hooks/lib/profile.mjs`**

```javascript
// hooks/lib/profile.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

export const VALID_AXES = {
  mastery:     ['low', 'medium', 'high'],
  consequence: ['low', 'medium', 'high'],
  intent:      ['growth', 'balanced', 'output'],
};

export const DEFAULTS = { mastery: 'medium', consequence: 'medium', intent: 'balanced' };

export function globalProfilePath() {
  return resolve(homedir(), '.claude', 'three-axes-profile.json');
}

export function sessionProfilePath() {
  return resolve(homedir(), '.claude', 'three-axes-session.json');
}

export function projectProfilePath() {
  try {
    const root = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return resolve(root, '.three-axes.json');
  } catch {
    return resolve(process.cwd(), '.three-axes.json');
  }
}

export function readProfile(filePath) {
  if (!existsSync(filePath)) return {};
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

export function mergeProfiles(...profiles) {
  return Object.assign({}, ...profiles);
}

export function resolveProfile(globalPath, projectPath, sessionPath) {
  const globalData  = readProfile(globalPath);
  const projectData = readProfile(projectPath);
  const sessionData = readProfile(sessionPath);
  const values = mergeProfiles(DEFAULTS, globalData, projectData, sessionData);

  const sources = {};
  for (const axis of Object.keys(VALID_AXES)) {
    if (sessionData[axis]  !== undefined) sources[axis] = 'session';
    else if (projectData[axis] !== undefined) sources[axis] = 'project';
    else if (globalData[axis]  !== undefined) sources[axis] = 'global';
    else sources[axis] = 'default';
  }

  return { values, sources };
}

export function writeProfile(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function validateProfile(data) {
  const errors = [];
  for (const [axis, value] of Object.entries(data)) {
    if (!VALID_AXES[axis]) {
      errors.push(`Unknown axis: "${axis}". Valid axes: ${Object.keys(VALID_AXES).join(', ')}`);
    } else if (!VALID_AXES[axis].includes(value)) {
      errors.push(`Invalid value for ${axis}: "${value}". Valid values: ${VALID_AXES[axis].join(', ')}`);
    }
  }
  return errors;
}

export function isFirstRun(globalPath, projectPath) {
  return !existsSync(globalPath) && !existsSync(projectPath);
}
```

- [ ] **Step 1.4: Run tests — verify they all pass**

```bash
cd C:/Users/luxsolari/three-axes-framework
node --test hooks/lib/__tests__/profile.test.mjs
```

Expected: all tests pass, no failures.

- [ ] **Step 1.5: Commit**

```bash
git add hooks/lib/profile.mjs hooks/lib/__tests__/profile.test.mjs
git commit -m "feat: add profile cascade utility module with tests"
```

---

## Task 2: Extend `inject-framework.mjs`

**Files:**
- Modify: `hooks/inject-framework.mjs`

- [ ] **Step 2.0: Read the current `hooks/inject-framework.mjs`**

Read `hooks/inject-framework.mjs` to understand the current 40-line implementation before replacing it.

- [ ] **Step 2.1: Replace `hooks/inject-framework.mjs` with the extended version**

Note on `for await` stdin reading (Issue 3): The `chunks.push(chunk)` pattern collects all incoming Buffer chunks into an array, and `Buffer.concat(chunks)` joins them into a single Buffer before parsing. This is the correct pattern for reading stdin in Node.js ESM — `process.stdin` is an async iterable where each yielded value is a Buffer chunk. The `try/catch` around the entire block defaults to `'startup'` on any parse error, which is the safe fallback (startup wipes the session file, which is the more conservative action).

```javascript
#!/usr/bin/env node
/**
 * Three Axes Framework — SessionStart injector (v1.1.0)
 *
 * Reads the SKILL.md, resolves the profile cascade, detects first-run,
 * wipes the session file on startup, and injects everything as additionalContext.
 */

import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  globalProfilePath,
  projectProfilePath,
  sessionProfilePath,
  resolveProfile,
  isFirstRun,
} from './lib/profile.mjs';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
if (!pluginRoot) process.exit(0);

// --- Read event type from stdin ---
let sessionEvent = 'startup';
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  sessionEvent = input.session_event ?? input.trigger ?? input.event ?? 'startup';
} catch { /* default to startup — safe: wipes session, never skips injection */ }

// --- Wipe session file on startup only ---
const sessionPath = sessionProfilePath();
if (sessionEvent === 'startup' && existsSync(sessionPath)) {
  try { unlinkSync(sessionPath); } catch { /* ignore */ }
}

// --- Load SKILL.md ---
const skillPath = join(pluginRoot, 'skills', 'three-axes-framework', 'SKILL.md');
let skillContent;
try {
  skillContent = readFileSync(skillPath, 'utf8');
} catch {
  process.exit(0);
}
const frameworkBody = skillContent.replace(/^---[\s\S]*?---\n/, '').trim();

// --- Resolve profile cascade ---
const globalPath  = globalProfilePath();
const projectPath = projectProfilePath();
const { values, sources } = resolveProfile(globalPath, projectPath, sessionPath);

// --- Build axis context block ---
const axisLines = Object.entries(values)
  .map(([axis, value]) => `  ${axis}: ${value} (${sources[axis]})`)
  .join('\n');
const axisContext = `## Active Profile\n\n${axisLines}`;

// --- First-run prompt ---
const firstRunPrompt = isFirstRun(globalPath, projectPath)
  ? `\n\n## First Run\n\nNo Three Axes profile found. Please start this session by running \`/three-axes setup\` to configure your profile. Until then, defaults apply (mastery: medium, consequence: medium, intent: balanced).`
  : '';

// --- Output ---
const output = {
  suppressOutput: true,
  systemMessage: 'Three Axes Framework active.',
  additionalContext: `${frameworkBody}\n\n${axisContext}${firstRunPrompt}`,
};

process.stdout.write(JSON.stringify(output) + '\n');
```

- [ ] **Step 2.2: Verify the hook runs without error**

```bash
cd C:/Users/luxsolari/three-axes-framework
CLAUDE_PLUGIN_ROOT=$(pwd) node hooks/inject-framework.mjs <<< '{"session_event":"startup"}'
```

Expected: JSON output with `suppressOutput`, `systemMessage`, and `additionalContext` fields. No errors.

Note: `CLAUDE_PLUGIN_ROOT=$(pwd) echo ... | node` does NOT export the variable to the node subprocess — the variable assignment only applies to the `echo` command. The `<<<` heredoc syntax passes the JSON to stdin while correctly propagating the env var to `node`.

- [ ] **Step 2.3: Verify resume event does NOT wipe session (manual test)**

```bash
# Create a fake session file
echo '{"mastery":"high"}' > ~/.claude/three-axes-session.json
# Simulate resume event
CLAUDE_PLUGIN_ROOT=$(pwd) node hooks/inject-framework.mjs <<< '{"session_event":"resume"}'
# Verify session file still exists
test -f ~/.claude/three-axes-session.json && echo "PASS: session preserved" || echo "FAIL: session was wiped"
# Cleanup
rm -f ~/.claude/three-axes-session.json
```

Expected: `PASS: session preserved`

- [ ] **Step 2.4: Commit**

```bash
git add hooks/inject-framework.mjs
git commit -m "feat: extend hook with profile cascade, first-run detection, session wipe"
```

---

## Task 3: `/three-axes setup` command

**Files:**
- Create: `commands/three-axes/setup.md`

Note: All command files in Tasks 3–6 are new files — they do not exist yet. No read step is needed before creating them. The `mkdir -p` in Step 3.1 creates the `commands/three-axes/` directory once; Tasks 4–6 can write files directly into it.

- [ ] **Step 3.1: Create the commands directory and setup command**

```bash
mkdir -p C:/Users/luxsolari/three-axes-framework/commands/three-axes
```

```markdown
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

3. Once I answer mastery, ask about **Consequence** — and only this:
   "What's the typical consequence level of the work you do?
   - **low** — personal experiments, throwaway scripts, learning exercises
   - **medium** — shared tools, libraries, portfolio-grade projects
   - **high** — production systems, money, user data, professional deliverables"

4. Once I answer consequence, ask about **Intent** — and only this:
   "What's your primary intent when working with AI?
   - **growth** — learning new languages, exploring architectures (AI teaches, doesn't solve)
   - **balanced** — real projects where quality results and learning both matter
   - **output** — shipping features, meeting deadlines (AI can do more heavy lifting)"

5. Confirm my choices and ask if I want to proceed.

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
```

- [ ] **Step 3.2: Commit**

```bash
git add commands/three-axes/setup.md
git commit -m "feat: add /three-axes setup command"
```

---

## Task 4: `/three-axes status` command

**Files:**
- Create: `commands/three-axes/status.md`

- [ ] **Step 4.1: Create the status command**

```markdown
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
```

- [ ] **Step 4.2: Commit**

```bash
git add commands/three-axes/status.md
git commit -m "feat: add /three-axes status command"
```

---

## Task 5: `/three-axes mode` command

**Files:**
- Create: `commands/three-axes/mode.md`

- [ ] **Step 5.1: Create the mode command**

```markdown
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

1. Parse the preset name from: `$ARGUMENTS` (trim whitespace, lowercase).

2. If the preset is not in the table above, respond with:
   "Unknown preset: `<name>`. Available presets: learning, output, production, explore, balanced"
   and stop.

3. Look up the three axis values for the preset.

4. Write `~/.claude/three-axes-session.json` using the Write tool with this content:
   ```json
   {
     "mastery": "<value>",
     "consequence": "<value>",
     "intent": "<value>"
   }
   ```

5. Confirm: "Session set to **<preset>** preset (mastery: <value>, consequence: <value>, intent: <value>). This applies for the current session only and will reset on next startup. Use `/three-axes status` to verify."
```

- [ ] **Step 5.2: Commit**

```bash
git add commands/three-axes/mode.md
git commit -m "feat: add /three-axes mode command"
```

---

## Task 6: `/three-axes set` command

**Files:**
- Create: `commands/three-axes/set.md`

- [ ] **Step 6.1: Create the set command**

```markdown
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

4. Read the existing target file (treat missing as `{}`). Merge the new values in. Write the result using the Write tool.

5. Confirm: "Set <axis>=<value> [, <axis>=<value>...] in <scope> profile." where scope is `session`, `project`, or `global`.
   Add: "Use `/three-axes status` to see the full resolved profile."
```

- [ ] **Step 6.2: Commit**

```bash
git add commands/three-axes/set.md
git commit -m "feat: add /three-axes set command"
```

---

## Task 6.5: Integration smoke-test (commands + hook)

This task verifies that all four commands are parseable markdown files and that the extended hook works end-to-end before touching `plugin.json`.

- [ ] **Step 6.5.1: Verify command files exist and are non-empty**

```bash
cd C:/Users/luxsolari/three-axes-framework
for f in commands/three-axes/setup.md commands/three-axes/status.md commands/three-axes/mode.md commands/three-axes/set.md; do
  [ -s "$f" ] && echo "PASS: $f" || echo "FAIL: $f is missing or empty"
done
```

Expected: four `PASS` lines.

- [ ] **Step 6.5.2: Run the full hook and spot-check the output**

```bash
cd C:/Users/luxsolari/three-axes-framework
CLAUDE_PLUGIN_ROOT=$(pwd) node hooks/inject-framework.mjs <<< '{"session_event":"startup"}' | node -e "
  let d=''; process.stdin.on('data', c => d+=c); process.stdin.on('end', () => {
    const o = JSON.parse(d);
    console.log('suppressOutput:', o.suppressOutput);
    console.log('systemMessage:', o.systemMessage);
    console.log('additionalContext starts with:', o.additionalContext?.slice(0,60));
    const ok = o.suppressOutput === true && typeof o.additionalContext === 'string' && o.additionalContext.length > 100;
    console.log(ok ? 'PASS' : 'FAIL');
  });
"
```

Expected: `PASS` — suppressOutput is true, additionalContext is a non-empty string containing the framework rules.

- [ ] **Step 6.5.3: Run unit tests one more time to confirm no regressions**

```bash
cd C:/Users/luxsolari/three-axes-framework
node --test hooks/lib/__tests__/profile.test.mjs
```

Expected: all tests pass.

---

## Task 7: Update `plugin.json`

**Files:**
- Modify: `.claude-plugin/plugin.json`

- [ ] **Step 7.0: Read the current `.claude-plugin/plugin.json`**

Read `.claude-plugin/plugin.json` to confirm current content before replacing it.

- [ ] **Step 7.1: Update plugin.json**

Replace the contents of `.claude-plugin/plugin.json` with:

```json
{
  "name": "three-axes-framework",
  "version": "1.1.0",
  "description": "Governs how AI assists developers by calibrating behavior across three axes — Mastery, Consequence, and Intent — to prevent comprehension debt while maximizing productivity.",
  "author": {
    "name": "Lux Solari",
    "email": "luxsolari@outlook.com",
    "url": "https://github.com/luxsolari"
  },
  "repository": "https://github.com/luxsolari/three-axes-framework",
  "license": "MIT",
  "keywords": [
    "ai-assisted-development",
    "comprehension-debt",
    "developer-philosophy",
    "learning",
    "code-quality"
  ],
  "commands": ["./commands/"]
}
```

- [ ] **Step 7.2: Commit**

```bash
git add .claude-plugin/plugin.json
git commit -m "feat: bump version to 1.1.0, declare commands directory"
```

---

## Task 8: Update `SKILL.md`

**Files:**
- Modify: `skills/three-axes-framework/SKILL.md`

- [ ] **Step 8.0: Read the current `skills/three-axes-framework/SKILL.md`**

Read `skills/three-axes-framework/SKILL.md` to locate the `## The Three Axes` heading and confirm the exact insertion point before editing.

- [ ] **Step 8.1: Add the Interaction Model section to SKILL.md**

Insert the following section immediately before `## The Three Axes` (after the opening Purpose/research block):

```markdown
---

## Interaction Model

The framework operates across three tiers. Each tier has narrower scope and higher priority than the one below it:

```
Tier 1 — Persistent Profile (baseline, cross-session)
  ~/.claude/three-axes-profile.json   global default
  .three-axes.json                    project override (repo root, committable)

  ↓ overridden by

Tier 2 — Session Commands (ephemeral, current session only)
  ~/.claude/three-axes-session.json   written by /three-axes mode and /three-axes set
  Cleared on startup, preserved across compact/resume

  ↓ overridden by

Tier 3 — Conversational Mode-Switch Signals (instant, current task only)
  Natural language phrases that shift axis values in-context.
  No file written. No persistence. Reverts when signal scope expires.
```

**Tier 3 signals — axis overrides and duration:**

| Say | Mode | Axis override | Duration |
|---|---|---|---|
| "Let me try this" / "I want to take a crack at it" | **Mentor** | `mastery=low, intent=growth` | Attempt-bounded — stays active until user finishes their attempt or requests review. Acknowledge: "I'll step aside — give it a try and let me know when you want a review." |
| "Just do it" / "Ship it" / "Handle the boilerplate" | **Output** | `mastery=high, intent=output` | Single-task — expires when the requested task is complete. |
| "Walk me through this" / "Why this approach?" | **Growth** | `intent=growth` | Topic-bounded — stays active until the topic or explanation concludes. Acknowledge: "I'll walk you through it — let me know when you're ready to move on." |
| "What are the tradeoffs?" | **Design** | `intent=balanced` + present-alternatives flag | Single-response — expires after presenting alternatives. Never give a default recommendation in this mode. |

Unspecified axes in a tier-3 signal (marked —) inherit from the active tier-1/tier-2 profile.

---
```

- [ ] **Step 8.2: Commit**

```bash
git add skills/three-axes-framework/SKILL.md
git commit -m "docs: add three-tier interaction model to SKILL.md"
```

---

## Task 9: Update `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 9.1: Read the current README**

Read `README.md` fully before editing.

- [ ] **Step 9.2: Add three new sections after the existing content**

Add the following after the existing installation/usage content (before any references section, or at the end if none exists):

```markdown
## How it works

The framework operates across three tiers. Each tier has narrower scope and higher priority:

```
Tier 1 — Persistent Profile         ~/.claude/three-axes-profile.json (global)
                                     .three-axes.json (project root, committable)
         ↓ overridden by
Tier 2 — Session Commands            ~/.claude/three-axes-session.json
         written by /three-axes mode and /three-axes set
         cleared on session start, preserved across compact/resume
         ↓ overridden by
Tier 3 — Conversational Signals      natural language, no files written, task-scoped
```

**Tier 3 mode-switch signals:**

| Say | Mode | Effect | Duration |
|---|---|---|---|
| "Let me try this" | Mentor | AI steps aside, reviews on request | Until attempt completes |
| "Just do it" | Output | Efficient, minimal ceremony | Single task |
| "Walk me through this" | Growth | AI teaches thoroughly | Until topic closes |
| "What are the tradeoffs?" | Design | AI presents alternatives, no recommendation | Single response |

---

## Commands

### `/three-axes setup`
Interactive first-run setup. Asks about each axis and writes your profile to `~/.claude/three-axes-profile.json`. Also triggered automatically on first session if no profile exists.

### `/three-axes status`
Shows the resolved profile for the current session, with source label for each axis (`global`, `project`, `session`, or `default`).

```
Three Axes Framework — current session
  mastery:     high        (global)
  consequence: high        (project)
  intent:      balanced    (default)
```

### `/three-axes mode <preset>`
Applies a named preset to the session (ephemeral — cleared on next startup).

| Preset | mastery | consequence | intent |
|---|---|---|---|
| `learning` | low | low | growth |
| `output` | high | medium | output |
| `production` | high | high | output |
| `explore` | low | medium | growth |
| `balanced` | medium | medium | balanced |

### `/three-axes set <axis>=<value> [--project|--global]`
Sets individual axis values. Default scope is session.

```bash
/three-axes set mastery=high                    # session (ephemeral)
/three-axes set consequence=high --project      # writes .three-axes.json
/three-axes set intent=growth --global          # writes ~/.claude/three-axes-profile.json
/three-axes set mastery=low intent=growth       # multiple axes, session scope
```

Valid values:
- `mastery`: `low` | `medium` | `high`
- `consequence`: `low` | `medium` | `high`
- `intent`: `growth` | `balanced` | `output`

---

## Profile Configuration

### Profile cascade

```
1. ~/.claude/three-axes-profile.json   global default (all projects)
2. .three-axes.json                    project override (repo root, committable)
3. ~/.claude/three-axes-session.json   session override (ephemeral, auto-cleared)
```

Keys not set in a layer fall through to the layer below. A project file with only `{ "consequence": "high" }` overrides just that axis, inheriting the rest from the global profile.

### Schema

All three files share the same optional-key shape:

```json
{
  "mastery":     "low" | "medium" | "high",
  "consequence": "low" | "medium" | "high",
  "intent":      "growth" | "balanced" | "output"
}
```

**Defaults** (when no layer specifies a value): `mastery=medium`, `consequence=medium`, `intent=balanced`.

### Project profiles

`.three-axes.json` is committable by default — useful for sharing team defaults. Add it to `.gitignore` if you want per-developer settings only.
```

- [ ] **Step 9.3: Commit**

```bash
git add README.md
git commit -m "docs: add How it Works, Commands, and Profile Configuration to README"
```

---

## Task 10: `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`

**Files:**
- Create: `CHANGELOG.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`

- [ ] **Step 10.0: Check which files already exist**

```bash
cd C:/Users/luxsolari/three-axes-framework
for f in CHANGELOG.md CONTRIBUTING.md LICENSE; do
  [ -f "$f" ] && echo "EXISTS: $f" || echo "MISSING (will create): $f"
done
```

If any file already exists, read it before writing to avoid overwriting existing content. If missing, create it fresh from the content below.

- [ ] **Step 10.1: Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-03-19

### Added
- Three-tier interaction model: persistent profile → session commands → conversational signals
- Profile cascade: global (`~/.claude/three-axes-profile.json`), project (`.three-axes.json`), session (`~/.claude/three-axes-session.json`)
- First-run detection: auto-triggers `/three-axes setup` when no profile exists
- `/three-axes setup` command — interactive axis configuration
- `/three-axes status` command — shows resolved profile with source labels
- `/three-axes mode <preset>` command — named presets (learning, output, production, explore, balanced)
- `/three-axes set` command — granular axis control with `--project` and `--global` scope flags
- Tier-3 signal axis mappings and duration semantics documented in SKILL.md
- Profile utility module (`hooks/lib/profile.mjs`) with unit tests
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`

## [1.0.0] - 2026-03-19

### Added
- Initial release: SessionStart hook with silent framework injection
- `three-axes-framework` skill with six principles, quick reference, and mode-switch signals
- Three axes defined: Mastery, Consequence, Intent
```

- [ ] **Step 10.2: Create `CONTRIBUTING.md`**

```markdown
# Contributing

## Reporting issues

Open an issue at [github.com/luxsolari/three-axes-framework/issues](https://github.com/luxsolari/three-axes-framework/issues). Include your Claude Code version, OS, and what you expected vs. what happened.

## Proposing changes

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes with tests where applicable
4. Run tests: `node --test hooks/lib/__tests__/profile.test.mjs`
5. Open a pull request against `main`

## Testing locally

Install the plugin from your local clone:

```
/plugin marketplace add ./path/to/three-axes-framework
/plugin install three-axes-framework@local
```

Or if you have the local marketplace configured:

```
/plugin install three-axes-framework@local
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that is not a fix or feature
- `test:` — adding or updating tests
- `chore:` — build process or tooling changes
```

- [ ] **Step 10.3: Create `LICENSE`**

```
MIT License

Copyright (c) 2026 Lux Solari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 10.4: Commit**

```bash
git add CHANGELOG.md CONTRIBUTING.md LICENSE
git commit -m "docs: add CHANGELOG, CONTRIBUTING, and LICENSE"
```

---

## Task 11: Update `lux-solari-plugins` marketplace

**Files:**
- Modify: `C:/Users/luxsolari/lux-solari-plugins/.claude-plugin/marketplace.json`

- [ ] **Step 11.0: Read the current `marketplace.json`**

Read `C:/Users/luxsolari/lux-solari-plugins/.claude-plugin/marketplace.json` to see the full current structure before modifying it.

- [ ] **Step 11.1: Update the version in marketplace.json**

Update the `three-axes-framework` entry version from `1.0.0` to `1.1.0`:

```json
{
  "name": "three-axes-framework",
  "description": "Always-active framework that calibrates AI behavior across Mastery, Consequence, and Intent axes to prevent comprehension debt.",
  "version": "1.1.0",
  ...
}
```

- [ ] **Step 11.2: Commit and push the marketplace repo**

```bash
cd C:/Users/luxsolari/lux-solari-plugins
git add .claude-plugin/marketplace.json
git commit -m "chore: bump three-axes-framework to 1.1.0"
git push origin main
```

- [ ] **Step 11.3: Commit and push the plugin repo**

```bash
cd C:/Users/luxsolari/three-axes-framework
git push origin main
```

---

## Task 12: End-to-end verification

- [ ] **Step 12.1: Install from remote marketplace**

In a new Claude Code session:

```
/plugin install three-axes-framework@lux-solari-plugins
```

- [ ] **Step 12.2: Verify hook fires on next session start**

Start a new session. The hook should inject the framework + default profile (no profile files exist yet). Expected behavior: Claude mentions first-run prompt or you see the framework is active.

- [ ] **Step 12.3: Run setup**

```
/three-axes setup
```

Verify it asks about each axis one at a time and writes `~/.claude/three-axes-profile.json`.

- [ ] **Step 12.4: Verify status**

```
/three-axes status
```

Verify it shows the resolved profile with correct source labels.

- [ ] **Step 12.5: Verify mode and set**

```
/three-axes mode learning
/three-axes status
/three-axes set mastery=high
/three-axes status
```

Verify session values appear with `(session)` label.

- [ ] **Step 12.6: Verify session clears on restart**

Start a new session. Run `/three-axes status`. Verify session values are gone and profile falls back to global/defaults.
