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
  // session_event is the primary field; trigger/event are aliases for forward-compat with hook API variations
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
// Phrased as an instruction TO Claude (not to the user) so Claude proactively surfaces it.
const firstRunPrompt = isFirstRun(globalPath, projectPath)
  ? `\n\n## IMPORTANT: First-Run Action Required\n\nNo Three Axes Framework profile has been configured yet. Your first response in this session MUST begin with this message to the user before addressing anything else:\n\n"Welcome! The Three Axes Framework is active but hasn't been configured yet. Run \`/three-axes setup\` to set your AI behavior preferences — it only takes a minute. Until then, defaults apply (mastery: medium, consequence: medium, intent: balanced)."\n\nAfter delivering this message, proceed normally.`
  : '';

// --- Output ---
const output = {
  suppressOutput: true,
  systemMessage: 'Three Axes Framework active.',
  additionalContext: `${frameworkBody}\n\n${axisContext}${firstRunPrompt}`,
};

process.stdout.write(JSON.stringify(output) + '\n');
