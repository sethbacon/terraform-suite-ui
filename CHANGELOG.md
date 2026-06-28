# Changelog

All notable changes to this project are documented in this file. It is maintained
automatically by [release-please](https://github.com/googleapis/release-please)
from [Conventional Commits](https://www.conventionalcommits.org/).

## 0.1.0

Initial release of the shared UI foundation for the Terraform suite frontends:

- **tokens** — brand colours, dark surfaces, font stack, border radius, RTL languages.
- **theme** — `createAppTheme`, `SuiteThemeProvider` (RTL + system theme + whitelabel), `useThemeMode`.
- **identity** — `AuthProvider` (driven by an injected `AuthApi`), `useAuth`, `SessionExpiryWarning`.
- **consent** — `ConsentProvider`, `ConsentBanner`.
- **components** — `PageHeader` (with icon), `DashboardCard`, `Page`.
- **shell** — `SuiteLayout`, `SuiteSwitcher`, nav types.
