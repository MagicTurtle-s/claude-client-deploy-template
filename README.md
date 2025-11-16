# Claude Client Deployment

**Template for client-specific Claude Desktop + Code + Orchestrator deployment**

This repository provides a complete, ready-to-deploy Claude setup with:
- Claude Desktop integration
- Claude Code CLI orchestrator
- On-demand MCP delegation (zero global token overhead)
- Customizable MCP selection per client

## Quick Start

### 1. Clone and Configure

```bash
# Use this template to create a new client repo
# (or clone if already created)

cd claude-client-deploy

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: At least one MCP access token
```

### 2. Customize MCPs

Edit `package.json` to include only the MCPs you need:

```json
"optionalDependencies": {
  "@magicturtle/mcp-hubspot": "^1.0.0"  // Keep only what you need
}
```

Edit `config/mcpConfig.json` to enable/disable MCPs:

```json
{
  "mcps": {
    "hubspot": {
      "enabled": true  // Set to true for MCPs you want
    }
  }
}
```

### 3. Install

```bash
# Install all dependencies and configure Claude Desktop
npm run install:all

# Validate installation
npm run validate
```

### 4. Restart Claude Desktop

Restart Claude Desktop to load the orchestrator.

### 5. Test

In Claude Code:

```
Test delegation by asking: "Use delegate_hubspot_task to list all companies"
```

## Available MCPs

| MCP | Description | Tools | Transport |
|-----|-------------|-------|-----------|
| HubSpot | CRM operations | 116 tools (companies, contacts, deals, leads) | HTTP |
| SharePoint | Document management | 11 tools (files, folders, sites) | HTTP |
| Asana | Project management | 42 tools (tasks, projects, goals) | SSE |

## Scripts

```bash
npm run install:all  # Install and configure everything
npm run update       # Update dependencies and reconfigure
npm run validate     # Check installation status
npm run uninstall    # Remove orchestrator from Claude Desktop
```

## Configuration

### Environment Variables (.env)

See `.env.example` for all available options. Key variables:

- `INSTALL_DIR`: Custom installation directory (default: home directory)
- `HUBSPOT_ACCESS_TOKEN`: Required if using HubSpot MCP
- `SHAREPOINT_CLIENT_ID` / `SHAREPOINT_CLIENT_SECRET`: Required if using SharePoint MCP
- `ASANA_ACCESS_TOKEN`: Required if using Asana MCP

### MCP Configuration (config/mcpConfig.json)

Enable/disable MCPs and view requirements.

## Architecture

```
Claude Desktop
  ↓ (uses orchestrator MCP)
Orchestrator Bridge
  ↓ (delegates to specialized instances)
Claude Code Subprocess 1 (HubSpot MCP loaded)
Claude Code Subprocess 2 (SharePoint MCP loaded)
Claude Code Subprocess 3 (Asana MCP loaded)
```

## Updating

```bash
# Update to latest versions
npm run update

# Check what would be updated
npm outdated

# Update specific package
npm update @magicturtle/claude-orchestrator
```

## Troubleshooting

### Installation Issues

```bash
# Validate installation
npm run validate

# Check Claude Code CLI
claude --version

# Check npm packages
npm list --depth=0
```

### Claude Desktop Not Seeing Orchestrator

1. Verify configuration: `npm run validate`
2. Check Claude Desktop config file location (shown in validate output)
3. Restart Claude Desktop
4. Check for errors in Claude Desktop logs

### MCP Authentication Errors

1. Verify tokens in `.env` file
2. Check token expiration with MCP provider
3. Ensure correct environment variable names

## Support

For issues:
1. Run `npm run validate` and fix any errors
2. Check `.env` configuration
3. Review `config/mcpConfig.json`
4. Contact your administrator for token issues

## License

UNLICENSED - This is client-specific configuration, not for redistribution.
