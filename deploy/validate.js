#!/usr/bin/env node
/**
 * Claude Client Deployment - Validation Script
 *
 * Validates installation and configuration
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

function check(condition, message, isWarning = false) {
  if (!condition) {
    if (isWarning) {
      console.log(`⚠️  WARN: ${message}`);
      warnings++;
    } else {
      console.log(`❌ ERROR: ${message}`);
      errors++;
    }
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function validate() {
  console.log('\n========================================');
  console.log('Claude Client Deployment - Validation');
  console.log('========================================\n');

  // Check 1: .env file exists
  const envPath = path.join(rootDir, '.env');
  try {
    await fs.access(envPath);
    check(true, '.env file exists');
  } catch {
    check(false, '.env file exists (copy from .env.example)', true);
  }

  // Check 2: node_modules exists
  try {
    await fs.access(path.join(rootDir, 'node_modules'));
    check(true, 'Dependencies installed');
  } catch {
    check(false, 'Dependencies installed (run: npm install)');
  }

  // Check 3: Orchestrator package installed
  try {
    await fs.access(path.join(rootDir, 'node_modules/@magicturtle/claude-orchestrator'));
    check(true, 'Orchestrator package installed');
  } catch {
    check(false, 'Orchestrator package installed');
  }

  // Check 4: Claude Code CLI available
  try {
    const { execSync } = await import('child_process');
    execSync('claude --version', { stdio: 'pipe' });
    check(true, 'Claude Code CLI available');
  } catch {
    check(false, 'Claude Code CLI available (install: npm i -g @anthropic-ai/claude-code)', true);
  }

  // Check 5: Claude Desktop config
  const platform = os.platform();
  let claudeConfigPath;

  if (platform === 'darwin') {
    claudeConfigPath = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
  } else if (platform === 'linux') {
    claudeConfigPath = path.join(os.homedir(), '.config/Claude/claude_desktop_config.json');
  } else if (platform === 'win32') {
    claudeConfigPath = path.join(process.env.APPDATA, 'Claude/claude_desktop_config.json');
  }

  try {
    const config = JSON.parse(await fs.readFile(claudeConfigPath, 'utf-8'));
    check(config.mcpServers && config.mcpServers['claude-code-orchestrator'], 'Claude Desktop configured with orchestrator');
  } catch {
    check(false, 'Claude Desktop configured (run: npm run install:all)');
  }

  // Summary
  console.log('\n========================================');
  console.log('Validation Summary');
  console.log('========================================');
  console.log(`✅ Passed: ${5 - errors - warnings}`);
  if (warnings > 0) console.log(`⚠️  Warnings: ${warnings}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  console.log('');

  if (errors > 0) {
    console.log('[ACTION REQUIRED] Fix errors above before using.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('[RECOMMENDED] Address warnings for best experience.\n');
  } else {
    console.log('[SUCCESS] All checks passed! ✨\n');
  }
}

validate().catch(err => {
  console.error(`[ERROR] Validation failed: ${err.message}`);
  process.exit(1);
});
