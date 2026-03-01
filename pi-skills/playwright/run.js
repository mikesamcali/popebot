#!/usr/bin/env node
/**
 * playwright/run.js — execute a Playwright script file
 * Usage: node run.js <script-path> [args...]
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('Usage: node run.js <script-path>');
  process.exit(1);
}

// Pass remaining args to the script via process.argv
process.argv = [process.argv[0], resolve(scriptPath), ...process.argv.slice(3)];

try {
  await import(pathToFileURL(resolve(scriptPath)).href);
} catch (err) {
  console.error('Script error:', err.message);
  process.exit(1);
}
