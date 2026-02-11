#!/usr/bin/env node
import { cpSync, rmSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const apiDir = join(rootDir, 'api');
const serverDir = join(rootDir, 'server');

// Ensure api directory exists
if (!existsSync(apiDir)) {
  mkdirSync(apiDir, { recursive: true });
}

// Keep the api/index.js entry point, just ensure server code is available
console.log('✅ API folder ready - server code available at ../server/');
