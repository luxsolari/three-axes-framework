import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CODEX = existsSync(join(ROOT, '.codex-plugin'));
const INJECTOR = CODEX ? 'inject-framework-codex.mjs' : 'inject-framework.mjs';

function fixture(t) {
  const temp = mkdtempSync(join(tmpdir(), 'three-axes-gate-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const cwd = join(temp, "project with 'quotes'");
  const home = join(temp, 'home');
  const config = join(home, CODEX ? 'custom-codex' : '.claude');
  mkdirSync(cwd, { recursive: true });
  mkdirSync(config, { recursive: true });
  const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: config, CLAUDE_PLUGIN_ROOT: ROOT };
  const global = join(config, 'three-axes-profile.json');
  const project = join(cwd, '.three-axes.json');
  const session = join(config, 'three-axes-session.json');
  const invoke = (script, payload, args = []) => {
    const result = spawnSync(process.execPath, [join(ROOT, 'hooks', script), ...args], {
      cwd: temp, env, input: JSON.stringify({ cwd, ...payload }), encoding: 'utf8',
    });
    assert.ifError(result.error);
    return { ...result, output: result.stdout ? JSON.parse(result.stdout) : undefined };
  };
  const gate = (payload) => invoke('require-profile.mjs', payload);
  const tool = (tool_name, tool_input = {}) => gate({ hook_event_name: 'PreToolUse', tool_name, tool_input });
  const write = (path, value) => writeFileSync(path, JSON.stringify(value));
  return { cwd, home, config, global, project, session, env, gate, tool, invoke, write };
}

const denied = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output?.hookSpecificOutput.permissionDecision, 'deny');
};
const allowed = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, undefined);
};

test('missing baseline prompts for setup and blocks ordinary tools', (t) => {
  const f = fixture(t);
  const start = f.invoke(INJECTOR, { source: 'startup' });
  assert.match(start.output.systemMessage, /setup required/);
  assert.match(start.output.hookSpecificOutput.additionalContext, /Three Axes setup required/);
  const prompt = f.gate({ hook_event_name: 'UserPromptSubmit', prompt: 'Build my application' });
  assert.match(prompt.output.hookSpecificOutput.additionalContext, /Pause the requested/);
  for (const tool of ['Bash', 'Write', 'Read', 'apply_patch', 'Agent', 'mcp__service__send']) denied(f.tool(tool));
  for (const tool of ['AskUserQuestion', 'request_user_input', 'request_user_input_async']) allowed(f.tool(tool));
});

test('either persistent scope unlocks work, including partial profiles', (t) => {
  const f = fixture(t);
  for (const path of [f.global, f.project]) {
    f.write(path, { consequence: 'high' });
    allowed(f.tool('Bash', { command: 'echo allowed' }));
    rmSync(path);
  }
});

test('session overrides alone never unlock work', (t) => {
  const f = fixture(t);
  f.write(f.session, { mastery: 'high', consequence: 'high', intent: 'output' });
  denied(f.tool('Bash'));
});

test('empty, malformed, non-object, and invalid profiles do not unlock work', (t) => {
  const f = fixture(t);
  for (const value of ['{}', '{bad json', 'null', '[]', '"high"', '{"mastery":"expert"}', '{"unknown":"high"}']) {
    writeFileSync(f.global, value);
    denied(f.tool('Bash'));
  }
  f.write(f.project, { intent: 'growth' });
  allowed(f.tool('Bash'));
});

test('setup writer is allowed only for exact commands and approved paths', (t) => {
  const f = fixture(t);
  const context = f.gate({ hook_event_name: 'UserPromptSubmit' }).output.hookSpecificOutput.additionalContext;
  const command = context.match(/^Project: (.+)$/m)[1];
  allowed(f.tool('Bash', { command }));
  for (const bad of [command + '; touch /tmp/unrelated', command + '\necho extra', command.replace('mastery=medium', 'mastery=expert'), command.replace('.three-axes.json', 'unrelated.json')]) {
    denied(f.tool('Bash', { command: bad }));
  }
  const written = spawnSync(command, { shell: true, env: f.env, cwd: f.cwd, encoding: 'utf8' });
  assert.equal(written.status, 0, written.stderr);
  assert.deepEqual(JSON.parse(readFileSync(f.project)), { mastery: 'medium', consequence: 'medium', intent: 'balanced' });
  allowed(f.tool('Bash', { command: 'echo resumed' }));
  const resumed = f.gate({ hook_event_name: 'UserPromptSubmit', prompt: 'Continue' });
  assert.match(resumed.output.hookSpecificOutput.additionalContext, /Setup gate is open/);
  assert.match(resumed.output.hookSpecificOutput.additionalContext, /mastery: medium \(project\)/);
  rmSync(f.project);
  denied(f.tool('Bash'));
});

test('writer rejects invalid input without modifying the target', (t) => {
  const f = fixture(t);
  f.write(f.project, { intent: 'growth' });
  const result = spawnSync(process.execPath, [join(ROOT, 'hooks/configure-profile.mjs'), f.project, 'mastery=expert', 'consequence=high', 'intent=output'], { env: f.env, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.deepEqual(JSON.parse(readFileSync(f.project)), { intent: 'growth' });
});

test('documented source field preserves session settings except on startup', (t) => {
  const f = fixture(t);
  f.write(f.project, { mastery: 'low' });
  for (const source of ['resume', 'clear', 'compact', 'startup']) {
    f.write(f.session, { mastery: 'high' });
    const result = f.invoke(INJECTOR, { source, session_event: 'startup' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(f.session), source !== 'startup');
    assert.match(result.output.hookSpecificOutput.additionalContext,
      source === 'startup' ? /mastery: low \(project\)/ : /mastery: high \(session\)/);
  }
});

test('project lookup uses the hook cwd and discovers a git root from subdirectories', (t) => {
  const f = fixture(t);
  assert.equal(spawnSync('git', ['init', '-q', f.cwd]).status, 0);
  const nested = join(f.cwd, 'src');
  mkdirSync(nested);
  f.write(f.project, { mastery: 'high' });
  allowed(f.gate({ cwd: nested, hook_event_name: 'PreToolUse', tool_name: 'Bash' }));
});

test('malformed hook input blocks rather than silently allowing work', (t) => {
  const f = fixture(t);
  const result = spawnSync(process.execPath, [join(ROOT, 'hooks/require-profile.mjs')], { env: f.env, input: '{bad', encoding: 'utf8' });
  assert.equal(result.status, 2);
});

if (CODEX) test('Codex accepts a valid legacy global profile only when its own is absent', (t) => {
  const f = fixture(t);
  mkdirSync(join(f.home, '.claude'));
  f.write(join(f.home, '.claude/three-axes-profile.json'), { mastery: 'high' });
  allowed(f.tool('Bash'));
  writeFileSync(f.global, '{}');
  denied(f.tool('Bash'));
});

test('global onboarding creates the selected baseline and reports its values', (t) => {
  const f = fixture(t);
  const context = f.gate({ hook_event_name: 'UserPromptSubmit' }).output.hookSpecificOutput.additionalContext;
  const command = context.match(/^Global: (.+)$/m)[1].replace('mastery=medium', 'mastery=low').replace('intent=balanced', 'intent=growth');
  allowed(f.tool('Bash', { command }));
  const written = spawnSync(command, { shell: true, env: f.env, cwd: f.cwd, encoding: 'utf8' });
  assert.ifError(written.error);
  assert.equal(written.status, 0, written.stderr);
  assert.match(written.stdout, /"intent":"growth"/);
  assert.deepEqual(JSON.parse(readFileSync(f.global)), { mastery: 'low', consequence: 'medium', intent: 'growth' });
  assert.equal(existsSync(f.project), false);
  allowed(f.tool('apply_patch'));
});

test('hook registration includes prompt guidance and synchronous tool enforcement', () => {
  const { hooks } = JSON.parse(readFileSync(join(ROOT, 'hooks/hooks.json')));
  for (const name of ['SessionStart', 'UserPromptSubmit', 'PreToolUse']) {
    assert.ok(hooks[name]?.length);
    for (const group of hooks[name]) {
      for (const handler of group.hooks) assert.notEqual(handler.async, true);
    }
  }
  assert.ok(new RegExp(hooks.PreToolUse[0].matcher).test('mcp__example__tool'));
});
