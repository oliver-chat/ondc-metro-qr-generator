# Release Automation

This repository uses Release Please for changelog and version management, then
publishes the package to npm from the same workflow after a GitHub release is
created.

## Flow

1. A normal PR is merged to `main`.
2. Release Please opens or updates a release PR based on Conventional Commits.
3. The release PR updates `CHANGELOG.md`, `package.json`, `bun.lock`, and
   `.release-please-manifest.json`.
4. When the release PR is merged, Release Please creates the GitHub release.
5. The workflow installs dependencies with Bun, runs `bun run check`, and runs
   `npm publish`.

## Required Setup

Create the GitHub repository as private:

```sh
gh auth login
gh repo create oliver-chat/ondc-metro-qr-generator \
  --private \
  --source=/Users/yash/dev/oliver/ondc-metro-qr-generator \
  --remote=origin \
  --push
```

Configure npm trusted publishing for this package:

- Publisher: GitHub Actions
- Organization: `oliver-chat`
- Repository: `ondc-metro-qr-generator`
- Workflow filename: `release.yml`
- Allowed action: `npm publish`

The workflow uses OIDC trusted publishing, so it does not require an `NPM_TOKEN`
secret.

If Release Please cannot open release PRs, enable this repository setting:

`Settings -> Actions -> General -> Allow GitHub Actions to create and approve pull requests`

## Initial Version

The first publish target is `0.0.1`. The release manifest is seeded at `0.0.1`
so later Release Please PRs calculate the next version from that baseline.
