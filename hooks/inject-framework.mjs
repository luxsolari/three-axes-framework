#!/usr/bin/env node
/**
 * Three Axes Framework — SessionStart injector
 *
 * Reads the SKILL.md and injects the framework as a systemMessage so it
 * operates as a background behavioral ruleset for the entire session,
 * regardless of topic or keyword triggers.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

if (!pluginRoot) {
  // Not running inside a Claude Code plugin context — exit silently.
  process.exit(0);
}

const skillPath = join(pluginRoot, 'skills', 'three-axes-framework', 'SKILL.md');

let skillContent;
try {
  skillContent = readFileSync(skillPath, 'utf8');
} catch {
  // SKILL.md missing — exit silently, don't break the session.
  process.exit(0);
}

// Strip YAML frontmatter (--- ... ---) before injecting the body only.
const body = skillContent.replace(/^---[\s\S]*?---\n/, '').trim();

const output = {
  suppressOutput: true,
  systemMessage: `Three Axes Framework — active for this session:\n\n${body}`
};

process.stdout.write(JSON.stringify(output) + '\n');
