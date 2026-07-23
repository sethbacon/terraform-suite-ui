# Security Policy

## Supported Versions

This package follows [semantic versioning](https://semver.org/) and is released from a single
`main` branch (see [CHANGELOG.md](CHANGELOG.md)). Only the latest published `0.x` version is
supported; please upgrade before reporting an issue against an older version.

## Past Fixes

[CHANGELOG.md](CHANGELOG.md)'s `0.5.3` entry, "address 2026-07-10 security audit findings (2 high,
16 medium, misc low)", fixed findings from an internal security review — see the
[v0.5.3 release](https://github.com/sethbacon/terraform-suite-ui/releases/tag/v0.5.3) for the
linked fix commits. Apps on an older `0.x` version should upgrade.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for a security vulnerability.

Instead, use [GitHub's private vulnerability reporting](https://github.com/sethbacon/terraform-suite-ui/security/advisories/new)
for this repository, or contact the maintainer directly. Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (a minimal repro is very helpful)
- Any suggested remediation, if you have one

We will acknowledge receipt as soon as possible and aim to provide an initial assessment within a
few business days. Because `@sethbacon/terraform-suite-ui` is consumed by both suite frontends
(`terraform-registry-frontend`, `terraform-state-manager-frontend`), a confirmed vulnerability
here may affect both apps — please give us a reasonable window to release a fix before any public
disclosure.
