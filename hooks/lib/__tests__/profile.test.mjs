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
