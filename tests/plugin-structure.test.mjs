// tests/plugin-structure.test.mjs
//
// Structural invariants for the plugin as shipped. These guard the things that
// break silently: a command file with no frontmatter (invisible in the command
// list), a rule ID that got duplicated or skipped during an edit, a doc or command
// menu that advertises a command nobody wrote, a shipped command missing from the
// menus that are supposed to list it, and a version bumped in one file but not the
// other two.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

const COMMAND_FILES = readdirSync(join(ROOT, 'commands')).filter((f) => f.endsWith('.md'));
const SKILL = read('skills', 'three-axes-framework', 'SKILL.md');
const README = read('README.md');
const CHANGELOG = read('CHANGELOG.md');
const MANIFEST = JSON.parse(read('.claude-plugin', 'plugin.json'));

describe('command files', () => {
  it('finds every documented command', () => {
    assert.ok(COMMAND_FILES.length >= 9, `only found ${COMMAND_FILES.length}`);
  });

  for (const file of COMMAND_FILES) {
    it(`${file} has frontmatter with a non-empty description`, () => {
      const body = read('commands', file);
      const match = body.match(/^---\n([\s\S]*?)\n---\n/);
      assert.ok(match, `${file} is missing a frontmatter block`);

      const description = match[1].match(/^description:\s*(.+)$/m);
      assert.ok(description, `${file} frontmatter has no description key`);
      assert.ok(
        description[1].trim().length > 10,
        `${file} description is too short to be useful in the command list`,
      );
    });
  }
});

describe('integrity rule IDs', () => {
  const declared = [...SKILL.matchAll(/^- \*\*(IR-\d{2}) /gm)].map((m) => m[1]);

  it('declares at least thirteen rules', () => {
    assert.ok(declared.length >= 13, `found ${declared.length}`);
  });

  it('has no duplicate IDs', () => {
    assert.equal(new Set(declared).size, declared.length, `duplicates in ${declared.join(', ')}`);
  });

  it('numbers contiguously from IR-01', () => {
    const expected = declared.map((_, i) => `IR-${String(i + 1).padStart(2, '0')}`);
    assert.deepEqual(declared, expected);
  });

  it('only references IDs that are declared', () => {
    const referenced = new Set([...SKILL.matchAll(/IR-\d{2}/g)].map((m) => m[0]));
    for (const id of referenced) {
      assert.ok(declared.includes(id), `${id} is referenced in SKILL.md but never declared`);
    }
  });
});

describe('documented commands exist on disk', () => {
  const available = new Set(COMMAND_FILES.map((f) => basename(f, '.md')));

  for (const [label, text] of [['README.md', README], ['SKILL.md', SKILL], ...COMMAND_FILES.map((f) => [`commands/${f}`, read('commands', f)])]) {
    it(`every /three-axes* command in ${label} has a file`, () => {
      // Slash-command mentions only: reject filesystem paths like
      // `~/.claude/three-axes-profile.json` on both sides of the name.
      const cited = new Set(
        [...text.matchAll(/(?<![\w.])\/(three-axes[a-z-]*)(?![\w.-])/g)].map((m) => m[1]),
      );
      for (const name of cited) {
        assert.ok(available.has(name), `${label} documents /${name} but commands/${name}.md is missing`);

      }
    });
  }
});

describe('command menus list every shipped command', () => {
  // /three-axes and /three-axes-framework both print a command table. A command
  // that ships without a row in both is invisible to anyone who discovers
  // commands that way — which is how 1.2.x shipped the bare invocation itself.
  const MENUS = ['three-axes.md', 'three-axes-framework.md'];
  const listable = COMMAND_FILES.map((f) => basename(f, '.md')).filter((n) => !MENUS.includes(`${n}.md`));

  for (const menu of MENUS) {
    it(`${menu} has a row for each of the other commands`, () => {
      const text = read('commands', menu);
      for (const name of listable) {
        assert.ok(text.includes(`/${name}`), `commands/${menu} has no row for /${name}`);
      }
    });
  }

  it('the two menus stay in sync with each other', () => {
    const rows = (menu) =>
      [...read('commands', menu).matchAll(/\|\s*`\/(three-axes[a-z-]*)[^`]*`\s*\|/g)].map((m) => m[1]);
    assert.deepEqual(rows(MENUS[0]), rows(MENUS[1]));
  });
});

describe('version consistency', () => {
  it('README badge matches plugin.json', () => {
    const badge = README.match(/badge\/version-([\d.]+)-informational/);
    assert.ok(badge, 'no version badge found in README');
    assert.equal(badge[1], MANIFEST.version);
  });

  it('newest CHANGELOG entry matches plugin.json', () => {
    const newest = CHANGELOG.match(/^## \[(\d+\.\d+\.\d+)\]/m);
    assert.ok(newest, 'no released version heading found in CHANGELOG');
    assert.equal(newest[1], MANIFEST.version);
  });
});
