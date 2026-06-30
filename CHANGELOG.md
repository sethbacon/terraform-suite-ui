# Changelog

All notable changes to this project are documented in this file. It is maintained
automatically by [release-please](https://github.com/googleapis/release-please)
from [Conventional Commits](https://www.conventionalcommits.org/).

## [0.5.1](https://github.com/sethbacon/terraform-suite-ui/compare/v0.5.0...v0.5.1) (2026-06-30)


### Bug Fixes

* **shell:** show user name and email in the account menu ([54d719e](https://github.com/sethbacon/terraform-suite-ui/commit/54d719e2d17b0f90a3dfa63987ed49ab6c448412))
* **shell:** show user name and email in the account menu ([4a1755d](https://github.com/sethbacon/terraform-suite-ui/commit/4a1755d52f6af3ccca89c22fb78fb7223daa461c))

## [0.5.0](https://github.com/sethbacon/terraform-suite-ui/compare/v0.4.1...v0.5.0) (2026-06-30)


### Features

* **shell:** render the whitelabel logo as the SuiteLayout brand ([73f88b9](https://github.com/sethbacon/terraform-suite-ui/commit/73f88b9cf067705d47e9f3f6dcdce8c4dd372871))
* **shell:** render the whitelabel logo as the SuiteLayout brand ([e66e16f](https://github.com/sethbacon/terraform-suite-ui/commit/e66e16f2ce0d6d5f740f0a77fef41c9827f67467))

## [0.4.1](https://github.com/sethbacon/terraform-suite-ui/compare/v0.4.0...v0.4.1) (2026-06-30)


### Bug Fixes

* **shell:** left-align SuiteLayout content container ([0185b78](https://github.com/sethbacon/terraform-suite-ui/commit/0185b781785bb1fec4287d0cdbd3e917c33917d3))
* **shell:** left-align SuiteLayout content container ([8b13771](https://github.com/sethbacon/terraform-suite-ui/commit/8b137719cafc96fa11da898c842ffad8a83126dd))

## [0.4.0](https://github.com/sethbacon/terraform-suite-ui/compare/v0.3.0...v0.4.0) (2026-06-29)


### Features

* **shell:** add content slots, Suspense, standalone nav items, persisted groups to SuiteLayout ([c0df035](https://github.com/sethbacon/terraform-suite-ui/commit/c0df0355fab4ab0730a9cb9fcbaf2184cb325e57))
* **shell:** content slots, Suspense, standalone nav items + persisted groups for SuiteLayout ([a92e1df](https://github.com/sethbacon/terraform-suite-ui/commit/a92e1df4b67cc3e5c8428656579f0ac919a68612))

## [0.3.0](https://github.com/sethbacon/terraform-suite-ui/compare/v0.2.0...v0.3.0) (2026-06-29)


### Features

* **shell:** add settingsMenu mode + supportMenu slot to SuiteLayout ([b50a381](https://github.com/sethbacon/terraform-suite-ui/commit/b50a381b86811e6ef7043d39f32c2f6c7d5a0cc2))
* **shell:** add settingsMenu mode and supportMenu slot to SuiteLayout ([3836ab9](https://github.com/sethbacon/terraform-suite-ui/commit/3836ab9928771ec4c946fe6b7fe849f367e5aafc))

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
