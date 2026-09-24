import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
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
  const outside = join(temp, 'outside');
  const home = join(temp, 'home');
  const config = join(home, CODEX ? 'custom-codex' : '.claude');
  mkdirSync(cwd, { recursive: true });
  mkdirSync(outside, { recursive: true });
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
  const invokeWithoutWorkspace = (script, payload, args = []) => {
    const result = spawnSync(process.execPath, [join(ROOT, 'hooks', script), ...args], {
      cwd: temp, env, input: JSON.stringify(payload), encoding: 'utf8',
    });
    assert.ifError(result.error);
    return { ...result, output: result.stdout ? JSON.parse(result.stdout) : undefined };
  };
  const gate = (payload) => invoke('require-profile.mjs', payload);
  const tool = (tool_name, tool_input = {}) => gate({ hook_event_name: 'PreToolUse', tool_name, tool_input });
  const write = (path, value) => writeFileSync(path, JSON.stringify(value));
  return { cwd, outside, home, config, global, project, session, env, gate, tool, invoke, invokeWithoutWorkspace, write };
}

const denied = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output?.hookSpecificOutput.permissionDecision, 'deny');
};
const allowed = (result) => {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, undefined);
};

test('missing baseline stays conversational until a project action is attempted', (t) => {
  const f = fixture(t);
  const start = f.invoke(INJECTOR, { source: 'startup', cwd: f.cwd });
  assert.equal(start.output.systemMessage, 'Three Axes Framework active.');
  assert.doesNotMatch(start.output.hookSpecificOutput.additionalContext, /Three Axes Framework profile required/);
  const prompt = f.gate({ hook_event_name: 'UserPromptSubmit', prompt: 'Build my application' });
  allowed(prompt);

  denied(f.tool('Bash', { command: 'pwd' }));
  denied(f.tool('Write', { file_path: join(f.cwd, 'app.js') }));
  denied(f.tool('Read', { file_path: join(f.cwd, 'README.md') }));
  denied(f.tool('apply_patch', { patch: '*** Begin Patch' }));
  denied(f.tool('functions.exec_command', { cmd: 'pwd', workdir: f.cwd }));
  denied(f.tool('view_image', { path: join(f.cwd, 'diagram.png') }));
  denied(f.tool('Glob'));
  denied(f.tool('write_stdin', { session_id: 123, chars: 'continue\n' }));

  for (const tool of ['AskUserQuestion', 'request_user_input', 'request_user_input_async', 'functions.request_user_input', 'Agent', 'WebSearch', 'WebFetch', 'imagegen', 'mcp__service__send']) {
    allowed(f.tool(tool));
  }
});

test('project action detection is path-aware and protects profile targets', (t) => {
  const f = fixture(t);
  allowed(f.tool('Read', { file_path: join(f.outside, 'notes.txt') }));
  allowed(f.tool('Write', { file_path: join(f.outside, 'artifact.txt') }));
  allowed(f.tool('functions.exec_command', { cmd: 'pwd', workdir: f.outside }));
  allowed(f.tool('view_image', { path: join(f.outside, 'reference.png') }));
  allowed(f.tool('mcp__service__read', { path: 'remote/document/123' }));
  allowed(f.tool('mcp__filesystem__read_file', { path: join(f.outside, 'notes.txt') }));

  denied(f.tool('Write', { file_path: f.global }));
  denied(f.tool('Read', { file_path: join(f.cwd, '..cache') }));
  denied(f.tool('mcp__filesystem__read_file', { path: join(f.cwd, 'README.md') }));
  denied(f.tool('mcp__filesystem__read_files', { paths: [join(f.outside, 'one'), join(f.cwd, 'two')] }));
  denied(f.tool('functions.exec_command', { cmd: `git -C ${f.cwd} status`, workdir: f.outside }));

  const alias = join(f.outside, 'project-alias');
  symlinkSync(f.cwd, alias, 'dir');
  denied(f.tool('Read', { file_path: join(alias, 'README.md') }));
});

test('projectless prompts do not receive setup guidance or tool blocks', (t) => {
  const f = fixture(t);
  const start = f.invokeWithoutWorkspace(INJECTOR, { source: 'startup' });
  assert.doesNotMatch(start.output.hookSpecificOutput.additionalContext, /## Three Axes Framework profile required/);
  allowed(f.invokeWithoutWorkspace('require-profile.mjs', { hook_event_name: 'UserPromptSubmit', prompt: 'Just chat' }));
  allowed(f.invokeWithoutWorkspace('require-profile.mjs', { hook_event_name: 'PreToolUse', tool_name: 'Bash' }));
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
  const context = f.tool('Bash', { command: 'pwd' }).output.hookSpecificOutput.permissionDecisionReason;
  assert.match(context, /allowed the conversation to proceed/);
  assert.match(context, /assistance defaults, not universal claims/);
  assert.match(context, /When no project profile exists, how much prior understanding should I assume\?/);
  assert.match(context, /For this repository's domain and tools, how much prior understanding should I assume\?/);
  const command = context.match(/^Project: (.+)$/m)[1];
  allowed(f.tool('Bash', { command }));
  allowed(f.tool('functions.exec_command', { cmd: command, workdir: f.cwd }));
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

test('every session lifecycle source uses the portable SessionStart envelope', (t) => {
  const f = fixture(t);
  for (const source of ['startup', 'resume', 'clear', 'compact']) {
    const result = f.invoke(INJECTOR, { source });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(Object.keys(result.output).sort(), ['hookSpecificOutput', 'suppressOutput', 'systemMessage']);
    assert.equal(result.output.additionalContext, undefined);
    assert.deepEqual(Object.keys(result.output.hookSpecificOutput).sort(), ['additionalContext', 'hookEventName']);
    assert.equal(result.output.hookSpecificOutput.hookEventName, 'SessionStart');
    assert.equal(typeof result.output.hookSpecificOutput.additionalContext, 'string');
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
  const context = f.tool('apply_patch').output.hookSpecificOutput.permissionDecisionReason;
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
