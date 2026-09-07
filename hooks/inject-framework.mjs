#!/usr/bin/env node
/**
 * Three Axes Framework — SessionStart injector
 *
 * Reads the SKILL.md, resolves the profile cascade,
 * wipes the session file on startup, and injects everything as additionalContext.
 */

import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  globalProfilePath,
  hasPersistentProfile,
  projectProfilePath,
  sessionProfilePath,
  resolveProfile,
} from './lib/profile.mjs';
import { setupContext } from './lib/setup.mjs';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
if (!pluginRoot) process.exit(0);

// --- Read event type from stdin ---
let sessionEvent = 'startup';
let cwd = process.cwd();
try {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  // source is the host field; keep the older aliases for compatibility.
  cwd = input.cwd || cwd;
  sessionEvent = input.source ?? input.session_event ?? input.trigger ?? input.event ?? 'startup';
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
const projectPath = projectProfilePath(cwd);
const { values, sources } = resolveProfile(globalPath, projectPath, sessionPath);

// --- Build axis context block ---
const axisLines = Object.entries(values)
  .map(([axis, value]) => `  ${axis}: ${value} (${sources[axis]})`)
  .join('\n');
const axisContext = `## Active Profile\n\n${axisLines}`;

// --- Output ---
const configured = hasPersistentProfile(cwd);
const output = {
  suppressOutput: true,
  systemMessage: configured ? 'Three Axes Framework active.' : 'Three Axes setup required before project work.',
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `${frameworkBody}\n\n${axisContext}${configured ? '' : `\n\n${setupContext(cwd)}`}`,
  },
};

process.stdout.write(JSON.stringify(output) + '\n');
