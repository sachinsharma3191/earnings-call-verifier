#!/usr/bin/env node
import { cpSync, existsSync } from 'fs';
import { join } from 'path';

const serverDir = join(process.cwd(), 'server');
const apiDir = join(process.cwd(), 'api');

if (existsSync(serverDir)) {
  cpSync(serverDir, apiDir, { recursive: true });
  console.log('✅ Synced server/ to api/');
} else {
  console.error('❌ server/ directory not found');
  process.exit(1);
}
