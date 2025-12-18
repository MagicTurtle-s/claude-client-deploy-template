# MCP Configuration Examples

This directory contains example configurations for different MCP combinations.
Copy the relevant files to customize your deployment.

## Available Configurations

| Example | MCPs Included | Use Case |
|---------|---------------|----------|
| `hubspot-only/` | HubSpot | CRM-focused deployments |
| `sharepoint-only/` | SharePoint | Document management deployments |
| `asana-only/` | Asana | Project management deployments |
| `all-mcps/` | HubSpot + SharePoint + Asana | Full-featured deployments |

## How to Use

1. Choose your desired configuration
2. Copy the `package.json` snippet into your root `package.json` under `optionalDependencies`
3. Copy the `mcpConfig.json` to `config/mcpConfig.json` (or merge the enabled flags)
4. Add required environment variables to your `.env` file
5. Run `npm run install:all`

## Required Environment Variables

| MCP | Required Variables |
|-----|-------------------|
| HubSpot | `HUBSPOT_ACCESS_TOKEN` |
| SharePoint | `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET` |
| Asana | `ASANA_ACCESS_TOKEN` |
