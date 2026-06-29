# Changelog

All notable changes to this project are documented in this file. It is maintained
automatically by [release-please](https://github.com/googleapis/release-please)
from [Conventional Commits](https://www.conventionalcommits.org/).

## [0.2.0](https://github.com/sethbacon/terraform-suite-ui/compare/v0.1.0...v0.2.0) (2026-06-29)


### Features

* **shell:** direct-open SuiteSwitcher with single-tab reuse ([fdda204](https://github.com/sethbacon/terraform-suite-ui/commit/fdda204572aafc170f3302b91d5c478735058836))
* **shell:** direct-open SuiteSwitcher with single-tab reuse ([1c5ef83](https://github.com/sethbacon/terraform-suite-ui/commit/1c5ef83169690f35ff3209fe54bafbd22b6d144e))

## 0.1.0

Initial release of the shared UI foundation for the Terraform suite frontends:

- **tokens** — brand colours, dark surfaces, font stack, border radius, RTL languages.
- **theme** — `createAppTheme`, `SuiteThemeProvider` (RTL + system theme + whitelabel), `useThemeMode`.
- **identity** — `AuthProvider` (driven by an injected `AuthApi`), `useAuth`, `SessionExpiryWarning`.
- **consent** — `ConsentProvider`, `ConsentBanner`.
- **components** — `PageHeader` (with icon), `DashboardCard`, `Page`.
- **shell** — `SuiteLayout`, `SuiteSwitcher`, nav types.
