# Example Theme

Reference **theme** plugin showing the `FluxoThemePlugin` / theme asset contract.

## Structure

| File          | Purpose                                      |
| ------------- | -------------------------------------------- |
| `plugin.json` | Theme manifest (`type: "theme"`)             |
| `tokens.ts`   | `ThemeTokens` (colors, fonts, CSS variables) |
| `theme.css`   | Base styles referencing CSS vars             |
| `layout.tsx`  | Optional layout shell                        |

Copy into `apps/frontend/assets/themes/<id>/` and register in the frontend theme registry to activate.

See [DEVELOPMENT.md](../../docs/plugins/DEVELOPMENT.md#themes).
