#!/usr/bin/env node
/**
 * Claude Client Deployment - Update Script
 *
 * Updates dependencies and re-configures Claude Desktop
 */

import { execSync } from 'child_process';

console.log('\n========================================');
console.log('Updating Claude Client Deployment');
console.log('========================================\n');

try {
  console.log('[INFO] Checking for package updates...');
  execSync('npm outdated', { stdio: 'inherit' });

  console.log('\n[INFO] Running npm update...');
  execSync('npm update', { stdio: 'inherit' });

  console.log('\n[INFO] Reconfiguring Claude Desktop...');
  execSync('node deploy/install.js', { stdio: 'inherit' });

  console.log('\n[SUCCESS] Update complete!');
  console.log('[INFO] Restart Claude Desktop to apply changes.\n');

} catch (err) {
  console.error(`[ERROR] Update failed: ${err.message}`);
  process.exit(1);
}
