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

export function projectProfilePath(cwd = process.cwd()) {
  try {
    const root = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return resolve(root, '.three-axes.json');
  } catch {
    return resolve(cwd, '.three-axes.json');
  }
}

export function readProfile(filePath) {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data !== null && typeof data === 'object' && !Array.isArray(data)
      && validateProfile(data).length === 0 ? data : {};
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
    if (!Object.hasOwn(VALID_AXES, axis)) {
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

// A session override is never a substitute for a persistent baseline.
export function isConfiguredProfile(filePath) {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data !== null && typeof data === 'object' && !Array.isArray(data)
      && Object.keys(data).length > 0 && validateProfile(data).length === 0;
  } catch {
    return false;
  }
}

export function persistentProfilePaths(cwd = process.cwd()) {
  return { global: globalProfilePath(), project: projectProfilePath(cwd) };
}

export function hasPersistentProfile(cwd = process.cwd()) {
  const paths = persistentProfilePaths(cwd);
  return isConfiguredProfile(paths.global) || isConfiguredProfile(paths.project);
}

export function activeProfile(cwd = process.cwd()) {
  const paths = persistentProfilePaths(cwd);
  const global = paths.global;
  return resolveProfile(global, paths.project, sessionProfilePath());
}
