#!/usr/bin/env node
/**
 * Claude Client Deployment - Installation Script
 *
 * Installs and configures Claude Desktop + Code + Orchestrator + MCPs
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function info(msg) {
  console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);
}

function success(msg) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`);
}

function warning(msg) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`);
}

function error(msg) {
  console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`);
}

// Load environment variables from .env file
async function loadEnv() {
  try {
    const envPath = path.join(rootDir, '.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const env = {};

    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    return env;
  } catch (err) {
    if (err.code === 'ENOENT') {
      warning('.env file not found, using defaults');
      return {};
    }
    throw err;
  }
}

// Get Claude Desktop config path based on OS
function getClaudeConfigPath() {
  const platform = os.platform();

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
  } else if (platform === 'linux') {
    return path.join(os.homedir(), '.config/Claude/claude_desktop_config.json');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA, 'Claude/claude_desktop_config.json');
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

// Main installation function
async function install() {
  console.log('\n========================================');
  console.log('Claude Client Deployment - Installation');
  console.log('========================================\n');

  try {
    // Step 1: Load environment
    info('Loading configuration...');
    const env = await loadEnv();

    // Step 2: Get installation paths
    const installDir = env.INSTALL_DIR || os.homedir();
    const orchestratorPath = path.join(rootDir, 'node_modules/@magicturtle/claude-orchestrator');

    // Default project paths
    const hubspotPath = env.HUBSPOT_PROJECT_PATH || path.join(installDir, 'hubspot-mcp-railway');
    const sharepointPath = env.SHAREPOINT_PROJECT_PATH || path.join(installDir, 'sharepoint-mcp-railway');
    const asanaPath = env.ASANA_PROJECT_PATH || path.join(installDir, 'asana-mcp-railway');

    // Default MCP URLs
    const hubspotUrl = env.HUBSPOT_MCP_URL || 'https://hubspot-mcp-railway-production-386b.up.railway.app/mcp';
    const sharepointUrl = env.SHAREPOINT_MCP_URL || 'https://sharepoint-mcp-railway-production.up.railway.app/mcp';
    const asanaUrl = env.ASANA_MCP_URL || 'https://asana-mcp-railway-production.up.railway.app/sse';

    success('Configuration loaded');
    info(`  Install directory: ${installDir}`);
    info(`  Orchestrator: ${orchestratorPath}`);

    // Step 3: Read Claude Desktop config template
    info('Generating Claude Desktop configuration...');
    const templatePath = path.join(rootDir, 'config/claudeDesktopConfig.template.json');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders
    template = template
      .replace(/\{\{ORCHESTRATOR_PATH\}\}/g, orchestratorPath.replace(/\\/g, '\\\\'))
      .replace(/\{\{HUBSPOT_PROJECT_PATH\}\}/g, hubspotPath.replace(/\\/g, '\\\\'))
      .replace(/\{\{SHAREPOINT_PROJECT_PATH\}\}/g, sharepointPath.replace(/\\/g, '\\\\'))
      .replace(/\{\{ASANA_PROJECT_PATH\}\}/g, asanaPath.replace(/\\/g, '\\\\'))
      .replace(/\{\{HUBSPOT_MCP_URL\}\}/g, hubspotUrl)
      .replace(/\{\{SHAREPOINT_MCP_URL\}\}/g, sharepointUrl)
      .replace(/\{\{ASANA_MCP_URL\}\}/g, asanaUrl)
      .replace(/\{\{DEBUG\}\}/g, env.DEBUG || 'false');

    const generatedConfig = JSON.parse(template);

    // Step 4: Update Claude Desktop config
    const claudeConfigPath = getClaudeConfigPath();
    info(`Claude Desktop config: ${claudeConfigPath}`);

    // Ensure directory exists
    await fs.mkdir(path.dirname(claudeConfigPath), { recursive: true });

    // Read existing config or create new
    let claudeConfig = { mcpServers: {} };
    try {
      const existing = await fs.readFile(claudeConfigPath, 'utf-8');
      claudeConfig = JSON.parse(existing);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    // Backup existing config
    if (Object.keys(claudeConfig.mcpServers || {}).length > 0) {
      const backupPath = `${claudeConfigPath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, JSON.stringify(claudeConfig, null, 2));
      info(`Backed up existing config to: ${backupPath}`);
    }

    // Merge configurations
    claudeConfig.mcpServers = {
      ...claudeConfig.mcpServers,
      ...generatedConfig.mcpServers
    };

    // Write updated config
    await fs.writeFile(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));
    success('Claude Desktop configured');

    // Step 5: Summary
    console.log('\n========================================');
    console.log('Installation Complete!');
    console.log('========================================\n');

    info('Next steps:');
    console.log('  1. Restart Claude Desktop to load the orchestrator');
    console.log('  2. In Claude Code, delegation tools are now available:');
    console.log('     - delegate_hubspot_task');
    console.log('     - delegate_sharepoint_task');
    console.log('     - delegate_asana_task');
    console.log('     - delegate_batch_tasks');
    console.log('');
    info('Configuration:');
    console.log(`  - Claude config: ${claudeConfigPath}`);
    console.log(`  - Environment: ${path.join(rootDir, '.env')}`);
    console.log('');

  } catch (err) {
    error(`Installation failed: ${err.message}`);
    if (process.env.DEBUG === 'true') {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Run installation
install().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
