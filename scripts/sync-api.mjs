#!/usr/bin/env node
import { cpSync, rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const apiDir = join(rootDir, 'api');
const serverDir = join(rootDir, 'server');

// Remove existing api directory
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true, force: true });
}

// Copy server to api
cpSync(serverDir, apiDir, { recursive: true });

console.log('✅ Synced server/ to api/');
