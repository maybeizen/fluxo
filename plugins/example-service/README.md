# Example Service Plugin

Reference implementation for Fluxo **service** plugins. Demonstrates:

- All config field types (`string`, `number`, `boolean`, `select`, dynamic options)
- `validateConfig()` with Zod
- Lifecycle hooks (`onLoad`, `onConfigChange`)
- `getIssues()` health reporting
- Mock `provisionService()` (no external API calls)

## Files

| File               | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `plugin.json`      | Manifest (`type: "service"`)               |
| `backend/index.ts` | Plugin class extending `FluxoServerPlugin` |

## Usage

Copy this directory as a starting point for new service integrations. See [DEVELOPMENT.md](../../docs/plugins/DEVELOPMENT.md) for the full guide.
