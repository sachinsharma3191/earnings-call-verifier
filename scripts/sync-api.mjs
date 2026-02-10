#!/usr/bin/env node
import { existsSync } from 'fs';
import { join } from 'path';

const apiDir = join(process.cwd(), 'api');

if (existsSync(apiDir)) {
  console.log('✅ API directory exists - no sync needed (server/ folder removed)');
} else {
  console.error('❌ api/ directory not found');
  process.exit(1);
}
