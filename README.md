# @sethbacon/terraform-suite-ui

Shared UI foundation for the Terraform suite frontends
([terraform-registry-frontend](https://github.com/sethbacon/terraform-registry-frontend)
and [terraform-state-manager-frontend](https://github.com/sethbacon/terraform-state-manager-frontend)).
It centralises the look-and-feel and cross-cutting behaviour so both apps stay in
visual and behavioural parity from a single source of truth.

## What's inside

| Area           | Exports                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **Tokens**     | `BRAND_PRIMARY`, `SECONDARY_LIGHT`, `SECONDARY_DARK`, dark surfaces, font stack, `BORDER_RADIUS`         |
| **Theme**      | `createAppTheme(mode, prefersReducedMotion, direction, overrides)`, `SuiteThemeProvider`, `useThemeMode` |
| **Identity**   | `AuthProvider` (parameterised by an `AuthApi`), `useAuth`, `hasScope`, `SessionExpiryWarning`, types     |
| **Consent**    | `ConsentProvider`, `useConsent`, `ConsentBanner`                                                         |
| **Components** | `PageHeader`, `DashboardCard`, `Page`                                                                    |
| **Shell**      | `SuiteLayout` (parameterised by nav + branding + auth), `SuiteSwitcher`, nav types                       |

Framework packages (React, MUI, Emotion, i18next, react-router, react-query) are
**peer dependencies** — the consuming app provides a single copy at runtime.

## Develop

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # tsup -> dist/ (ESM + .d.ts)
```

## Publishing (GitHub Packages)

Publishing is automated by [`.github/workflows/publish.yml`](.github/workflows/publish.yml):
create a GitHub Release tagged `vX.Y.Z` (matching `package.json`) and the workflow
builds, type-checks, tests, and runs `npm publish` to `https://npm.pkg.github.com`
using the repo's `GITHUB_TOKEN`.

## Consuming (in each frontend)

Add to the app's `.npmrc` so the scope resolves to GitHub Packages:

```ini
@sethbacon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then:

```bash
npm install @sethbacon/terraform-suite-ui
```

```tsx
import { SuiteThemeProvider, PageHeader, useAuth } from '@sethbacon/terraform-suite-ui'
```

> This package is a **build-time** dependency only; each app remains independently
> deployable. Wiring the two apps to consume it is intentionally a separate step.
