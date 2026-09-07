#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import { writeProfile } from './lib/profile.mjs';
import { validateSetupValues } from './lib/setup.mjs';

try {
  const [target, ...args] = process.argv.slice(2);
  if (!target || !isAbsolute(target)) throw new Error('An absolute profile path is required.');
  const values = validateSetupValues(args);
  mkdirSync(dirname(target), { recursive: true });
  writeProfile(target, values);
  process.stdout.write(`Three Axes profile saved to ${target}: ${JSON.stringify(values)}. Setup gate is open; resume the original request using this baseline.\n`);
} catch (error) {
  process.stderr.write(`Three Axes setup failed: ${error.message}\n`);
  process.exitCode = 1;
}
