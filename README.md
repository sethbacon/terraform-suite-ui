# @sethbacon/terraform-suite-ui

Shared UI foundation for the Terraform suite frontends
([terraform-registry-frontend](https://github.com/sethbacon/terraform-registry-frontend)
and [terraform-state-manager-frontend](https://github.com/sethbacon/terraform-state-manager-frontend)).
It centralises the look-and-feel and cross-cutting behaviour so both apps stay in
visual and behavioural parity from a single source of truth.

## What's inside

| Area           | Exports                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Tokens**     | `BRAND_PRIMARY`, `SECONDARY_LIGHT`, `SECONDARY_DARK`, dark surfaces, font stack, `BORDER_RADIUS`, `RTL_LANGUAGES`            |
| **Theme**      | `createAppTheme(mode, prefersReducedMotion, direction, overrides)`, `SuiteThemeProvider`, `useThemeMode`                     |
| **Identity**   | `AuthProvider` (parameterised by an `AuthApi`), `useAuth` (returns `hasScope`), `ADMIN_SCOPE`, `SESSION_WARNING_LEAD_MS`, `SessionExpiryWarning`, types |
| **Consent**    | `ConsentProvider`, `useConsent`, `ConsentBanner`                                                                             |
| **Components** | `PageHeader`, `DashboardCard`, `Page`, `NotificationChannelsSection`, `ApiKeyExpirySettingsCard`                             |
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
- Every release generates [GitHub Artifact Attestations](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)
  — build provenance plus a CycloneDX SBOM — bound to the exact published npm tarball. Verify by
  fetching the tarball and checking it:

  ```bash
  npm pack @sethbacon/terraform-suite-ui
  gh attestation verify --repo sethbacon/terraform-suite-ui ./sethbacon-terraform-suite-ui-*.tgz
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
- **`onClearStorage` is how you clear YOUR app's cached auth data when the session ends** — on
  explicit logout AND when the session fails closed (a 401, a lapsed session, or a malformed
  `/me` response). Pass it whenever your app caches anything auth-related (a bearer token, query
  data keyed to the signed-in user) outside of `AuthProvider`'s own React state.
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
- **`isSafeUrl` is the URL guard the shared components apply to host-supplied URLs** before using
  them for navigation (`SuiteSwitcher`) or image sinks (`SuiteLayout`/`SuiteThemeProvider`
  branding). It is exported so your app can apply the same allowlist (http/https/mailto/tel and
  relative paths only) to any backend- or user-influenced URL at its own boundary.
