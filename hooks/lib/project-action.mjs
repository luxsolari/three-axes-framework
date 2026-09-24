import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const FILE_TOOLS = new Map([
  ['read', ['file_path']],
  ['write', ['file_path']],
  ['edit', ['file_path']],
  ['multiedit', ['file_path']],
  ['notebookedit', ['notebook_path']],
  ['glob', ['path']],
  ['grep', ['path']],
  ['ls', ['path']],
  ['view_image', ['path']],
]);

const SHELL_TOOLS = new Set([
  'bash',
  'powershell',
  'exec_command',
  'shell',
  'shell_command',
  'write_stdin',
]);

const PATCH_TOOLS = new Set(['apply_patch']);
const PATH_KEYS = new Set([
  'cwd',
  'directory',
  'directory_path',
  'dir_path',
  'file',
  'file_path',
  'notebook_path',
  'path',
  'paths',
  'workdir',
  'working_directory',
]);

function canonicalPath(value) {
  let cursor = resolve(value);
  const missing = [];

  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) break;
    missing.unshift(basename(cursor));
    cursor = parent;
  }

  try {
    return resolve(realpathSync.native(cursor), ...missing);
  } catch {
    return resolve(value);
  }
}

function isWithin(root, target) {
  const from = canonicalPath(root);
  const to = canonicalPath(target);
  const nested = relative(from, to);
  return nested === '' || (nested !== '..' && !nested.startsWith(`..${sep}`) && !isAbsolute(nested));
}

function baseToolName(toolName) {
  if (typeof toolName !== 'string') return '';
  return toolName.split('.').at(-1).toLowerCase();
}

function valuesForKeys(value, keys, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) valuesForKeys(item, keys, found);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (keys.has(key) && typeof item === 'string') found.push(item);
      else if (keys.has(key) && Array.isArray(item)) {
        for (const entry of item) if (typeof entry === 'string') found.push(entry);
      } else valuesForKeys(item, keys, found);
    }
  }
  return found;
}

function targetsProtectedPath(toolInput, protectedPaths) {
  const candidates = valuesForKeys(toolInput, PATH_KEYS);
  return candidates.some((candidate) => isAbsolute(candidate)
    && protectedPaths.some((protectedPath) => canonicalPath(candidate) === canonicalPath(protectedPath)));
}

function commandText(toolInput) {
  if (typeof toolInput?.command === 'string') return toolInput.command;
  if (typeof toolInput?.cmd === 'string') return toolInput.cmd;
  return '';
}

function shellWorkdir(toolInput, cwd) {
  for (const key of ['workdir', 'cwd', 'working_directory']) {
    if (typeof toolInput?.[key] === 'string' && toolInput[key].length > 0) return toolInput[key];
  }
  return cwd;
}

export function shellCommand(input) {
  return commandText(input?.tool_input);
}

export function isShellTool(toolName) {
  return SHELL_TOOLS.has(baseToolName(toolName));
}

export function isProjectAction(input, cwd, protectedPaths = []) {
  const tool = baseToolName(input?.tool_name);
  const toolInput = input?.tool_input ?? {};

  if (targetsProtectedPath(toolInput, protectedPaths)) return true;

  if (PATCH_TOOLS.has(tool)) return true;

  if (SHELL_TOOLS.has(tool)) {
    if (tool === 'write_stdin') return true;
    const workdir = shellWorkdir(toolInput, cwd);
    if (isWithin(cwd, workdir)) return true;

    const command = commandText(toolInput);
    const protectedRoots = [cwd, ...protectedPaths].map(canonicalPath);
    return protectedRoots.some((path) => command.includes(path));
  }

  if (FILE_TOOLS.has(tool)) {
    const keys = new Set(FILE_TOOLS.get(tool));
    const paths = valuesForKeys(toolInput, keys);
    if (paths.length === 0) return true;
    return paths.some((path) => isWithin(cwd, isAbsolute(path) ? path : resolve(cwd, path)));
  }

  // Unknown and MCP tools remain conversational/external by default. If they
  // explicitly expose an absolute local path inside the workspace, however,
  // they cross the same project boundary as a built-in file tool.
  return valuesForKeys(toolInput, PATH_KEYS)
    .some((path) => isAbsolute(path) && isWithin(cwd, path));
}
