#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distEntry = resolve(__dirname, '..', 'dist', 'cli', 'index.js');
const srcEntry = resolve(__dirname, '..', 'src', 'cli', 'index.ts');

if (existsSync(distEntry)) {
  const mod = await import(distEntry);
  if (mod.main) await mod.main();
} else if (existsSync(srcEntry)) {
  const { register } = await import('tsx/esm/api');
  register();
  const mod = await import(srcEntry);
  if (mod.main) await mod.main();
} else {
  console.error('oh-my-gemini-cli: build not found. Run "npm run build" first.');
  process.exit(1);
}
