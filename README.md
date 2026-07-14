# @sethbacon/terraform-suite-ui

Shared UI foundation for the Terraform suite frontends
([terraform-registry-frontend](https://github.com/sethbacon/terraform-registry-frontend)
and [terraform-state-manager-frontend](https://github.com/sethbacon/terraform-state-manager-frontend)).
It centralises the look-and-feel and cross-cutting behaviour so both apps stay in
visual and behavioural parity from a single source of truth.

## What's inside

| Area           | Exports                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Tokens**     | `BRAND_PRIMARY`, `SECONDARY_LIGHT`, `SECONDARY_DARK`, dark surfaces, font stack, `BORDER_RADIUS`                             |
| **Theme**      | `createAppTheme(mode, prefersReducedMotion, direction, overrides)`, `SuiteThemeProvider`, `useThemeMode`                     |
| **Identity**   | `AuthProvider` (parameterised by an `AuthApi`), `useAuth` (returns `hasScope`), `ADMIN_SCOPE`, `SessionExpiryWarning`, types |
| **Consent**    | `ConsentProvider`, `useConsent`, `ConsentBanner`                                                                             |
| **Components** | `PageHeader`, `DashboardCard`, `Page`                                                                                        |
| **Shell**      | `SuiteLayout` (parameterised by nav + branding + auth), `SuiteSwitcher`, nav types                                           |
| **Utils**      | `isSafeUrl` (host-supplied URL guard for navigation / image sinks)                                                           |

Framework packages (React, MUI, Emotion, i18next, react-router) are
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

**Integrity guarantees for consumers:**

- The publish job refuses to publish unless the triggering ref is exactly the git tag matching
  `package.json`'s version — a manual `workflow_dispatch` run against an arbitrary branch is
  rejected, not just discouraged. This tag/version check is the guarantee enforced by code in
  this repository. The job also targets a GitHub Environment (`release`); any human-review gate
  on that environment must be configured as a required-reviewer rule in repo **Settings** (not
  tracked in git), so independent-review protection is not guaranteed by this repository alone.
- Before `npm publish`, CI asserts the tarball (`npm pack --dry-run`) only contains `dist/` plus
  `package.json`/`README.md`/`LICENSE`/`NOTICE` — no source, tests, or config files ship.
- Every release generates a [GitHub Artifact Attestation](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)
  for the built `dist/` output, which you can verify against a downloaded/installed package with:

  ```bash
  gh attestation verify --repo sethbacon/terraform-suite-ui node_modules/@sethbacon/terraform-suite-ui/dist/index.js
  ```

- CI runs `npm audit --audit-level=high` on every push/PR, and CodeQL (`javascript-typescript`)
  runs on every push/PR plus a weekly schedule (see [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml)).
- A [`commitlint`](https://commitlint.js.org/) check on every PR enforces Conventional Commits,
  since [release-please](.github/workflows/release-please.yml) derives version bumps solely from
  commit messages.

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

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

## Security model

- **Token custody is the host app's responsibility.** `AuthProvider` is parameterised by an
  `AuthApi` your app implements (`getCurrentUser`/`login`/`logout`/`refreshToken`/etc.) — this
  library never reads or writes a token/cookie itself. Prefer an HttpOnly cookie over storing a
  bearer token in `localStorage`/`sessionStorage` if your backend supports it.
- **`onClearStorage` is how you clear YOUR app's cached auth data on logout** (e.g. a cached
  bearer token, cached query data keyed to the signed-in user). Pass it whenever your app caches
  anything auth-related outside of `AuthProvider`'s own React state.
- **`hasScope`/`allowedScopes` are UI-visibility gates only — NOT an authorization boundary.**
  They hide/show nav items and affordances client-side; every backend endpoint must
  independently re-enforce authorization on every request regardless of what the client believes.
  The special `ADMIN_SCOPE` (`'admin'`) wildcard mirrors the backend's own admin-wildcard
  convention — do not rely on it as a security control in this library.
- **`refreshSession()` logs out on failure** (a failed token refresh clears the session rather
  than leaving a stale/ambiguous state); `authError` on the auth context exposes the raw error
  from the most recent failed session-resolution call if your app wants to distinguish a network
  blip from a real "not logged in" state.
- Pass an app-specific `storageKey` to `ConsentProvider`/`SuiteThemeProvider` if your app shares an
  origin with a sibling suite app — the default keys are generic and will collide otherwise (the
  providers log a one-time console warning if you don't).
