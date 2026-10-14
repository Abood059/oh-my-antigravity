#!/usr/bin/env node
/*
 * OmA workspace expansion hook.
 *
 * Runs once per session (idempotent). Adds the plugin root to
 * permissions.allow in ~/.gemini/antigravity-cli/settings.json
 * so subagents can read skill and script files without prompts.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '..', '..');

// Detect settings.json path
const home = os.homedir();
const candidates = [
  path.join(home, '.gemini', 'antigravity-cli', 'settings.json'),
  path.join(home, '.gemini', 'settings.json'),
];

let settingsPath = candidates[0];
for (const c of candidates) {
  if (existsSync(c)) {
    settingsPath = c;
    break;
  }
}

// Read existing settings (or start fresh)
let settings = {};
try {
  settings = JSON.parse(await readFile(settingsPath, 'utf-8'));
} catch {
  settings = {};
}

// Ensure structure
settings.permissions = settings.permissions || {};
settings.permissions.allow = settings.permissions.allow || [];

// Build permissions for this plugin
const readPerm = `read_file(${pluginRoot})`;
const writePerm = `write_file(${pluginRoot})`;

let changed = false;

if (!settings.permissions.allow.includes(readPerm)) {
  settings.permissions.allow.push(readPerm);
  changed = true;
}

if (!settings.permissions.allow.includes(writePerm)) {
  settings.permissions.allow.push(writePerm);
  changed = true;
}

// Only write if changed (idempotent)
if (changed) {
  await mkdir(path.dirname(settingsPath), { recursive: true });
  await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  console.log(`[OMA] Workspace expanded: ${pluginRoot}`);
}

// Always exit cleanly (fail-open)
process.exit(0);
