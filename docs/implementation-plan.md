# ONDC Metro QR Generator Implementation Plan

Date: 2026-07-09

## Goal

Build `ondc-metro-qr-generator` as a standalone Bun TypeScript package for
generating ONDC metro ticket QR payloads and PNGs across the BPPs Oliver is live
with.

The first publish target is `ondc-metro-qr-generator@0.0.1`.

The GitHub repository must be created private under `oliver-chat` first. Do not
make the repository public until the team explicitly approves that launch step.

## Why This Package Exists

BPPs, AFC teams, ONDC, and buyer apps need a shared, reproducible implementation
for QR generation. The package should make Oliver's QR policy explicit and
testable without leaking Oliver internals, production data, user data, or
ticket-rendering UI.

The package should prove this boundary:

- Which BPP policy applies.
- Which payload bytes/string are encoded into QR.
- Whether generated QR images decode back to the expected payload.

It should not try to prove whether a specific AFC gate accepted a ticket.

## Evidence To Preserve In Public Messaging

Current live BPP policy shape:

| BPP | QR policy | Notes |
| --- | --- | --- |
| `ondc-prod-bmrcl.sequelstring.com/seller/bmrcl` | dynamic timestamp | Appends BMRCL dynamic block to provider token. |
| `ondc-prod-dmrc.sequelstring.com/seller/dmrc` | static | Encodes provider token unchanged. |
| `ondc-prod-mmmocl.sequelstring.com/seller/mmmocl` | base64 byte mode | Decodes base64 token into raw byte-mode QR data. |
| `ondc-prod-mmmopl.sequelstring.com/seller/mmmopl` | static | Encodes provider token unchanged. |
| `ondc-prod-mmmrcl.sequelstring.com/seller/mmmrcl` | static | Encodes provider token unchanged. |

Use synthetic provider-shaped fixtures in this package. Do not commit raw
production QR tokens or production identifiers.

## Code Guidelines

Follow the local TypeScript skill and the stricter review bar from the
thermo-nuclear code-quality skill.

### TypeScript Conventions

- Use TypeScript for all source and tests.
- Enable strict compiler options:
  - `strict`
  - `exactOptionalPropertyTypes`
  - `noImplicitReturns`
  - `noUnusedLocals`
  - `noUnusedParameters`
  - `verbatimModuleSyntax`
  - Node-style ESM resolution
- Avoid `any`.
- Avoid broad `Record<string, unknown>` public APIs.
- Keep public inputs precise and named:
  - `BuildMetroQrPayloadParameters`
  - `BuildMetroQrPayloadReturnType`
  - `RenderMetroQrPngParameters`
  - `RenderMetroQrPngReturnType`
- Prefer immutable data:
  - `readonly` arrays and object properties
  - `as const` policy tables
- Prefer discriminated unions over optional mode flags.
- Prefer direct pure functions over classes.
- Use named functions for non-trivial logic.
- Use explicit error classes for public boundary failures.
- Public exports need concise JSDoc and an importable example.

### Library Design Conventions Inspired By viem

- Keep the public API surface small and explicit.
- Keep function-specific parameter and return types next to the function.
- Use type-only imports when importing types.
- Publish ESM with declaration files.
- Use explicit package exports.
- Run package checks before publish:
  - tests
  - TypeScript
  - lint/format
  - package export validation
  - npm dry-run
- Avoid accidental internal barrels. Only export stable public APIs from
  `src/index.ts`.

### Quality Bar

- No hidden fallback behavior.
- Unknown BPPs must throw/return a typed unsupported-BPP error.
- No environment-string policy configuration in the library.
- No Oliver runtime dependencies.
- No ticket-branding or ticket-image layout code.
- No production data fixtures.
- No generic QR helper that hides BPP policy.
- No file should approach 1000 lines.
- Prefer deleting concepts over adding abstractions.

## Public API Scope

Initial exports:

```ts
BppID
MetroQR.bmrcl(parameters): BuildMetroQrProviderReturnType
MetroQR.dmrc(parameters): BuildMetroQrProviderReturnType
MetroQR.mmmocl(parameters): BuildMetroQrProviderReturnType
MetroQR.mmopl(parameters): BuildMetroQrProviderReturnType
MetroQR.mmrcl(parameters): BuildMetroQrProviderReturnType
MetroQR.renderPng({ payload, qrOptions? }): Promise<RenderMetroQrPayloadPngReturnType>
buildMetroQrPayload(parameters): BuildMetroQrPayloadReturnType
renderMetroQrPayloadPng(parameters): Promise<RenderMetroQrPayloadPngReturnType>
renderMetroQrPng(parameters): Promise<RenderMetroQrPngReturnType>
getMetroQrPolicy(parameters): GetMetroQrPolicyReturnType
assertMetroQrPolicy(parameters): AssertMetroQrPolicyReturnType
isKnownMetroQrBpp(parameters): IsKnownMetroQrBppReturnType
buildBmrclDynamicBlock(parameters): BuildBmrclDynamicBlockReturnType
MetroQrError
UnsupportedMetroBppError
InvalidMetroQrTokenError
```

Policy shape:

```ts
type MetroQrPolicy =
  | { kind: 'static'; bppId: KnownBppId }
  | { kind: 'base64-byte'; bppId: KnownBppId }
  | { kind: 'dynamic-timestamp'; bppId: KnownBppId; refreshSeconds: 30 }
```

Payload shape:

```ts
type MetroQrPayload =
  | { kind: 'text'; text: string; policy: MetroQrPolicy }
  | { kind: 'bytes'; bytes: Uint8Array; policy: MetroQrPolicy }
```

## Sprint Plan

### Phase 1: Public QR Generator Package

#### Sprint / PR 1: Scaffold clean Bun TypeScript package

Atomic task / commit 1: `docs: add implementation plan and conventions`

- Save this implementation plan.
- Include privacy requirement for the GitHub repo.
- Include code-quality and TypeScript conventions.
- Verification: `git status --short`

Atomic task / commit 2: `chore: scaffold bun typescript package`

- Add `package.json`, `tsconfig.json`, formatter/lint config, `.gitignore`,
  `LICENSE`, `README.md`, and `AGENTS.md`.
- Keep package version at `0.0.1`.
- Verification: `bun install && bun run typecheck`

#### Sprint / PR 2: Implement provider QR policy and payload generation

Atomic task / commit 1: `feat: define metro qr provider policies`

- Add policy table for BMRCL, DMRC, MMMOCL, MMOPL, and MMRCL.
- Derive public literal types from the table.
- Verification: `bun test test/policies.test.ts`

Atomic task / commit 2: `feat: build qr payloads for live bpps`

- Implement static, base64 byte-mode, and BMRCL dynamic timestamp
  payload generation.
- Verification: `bun test test/payload.test.ts`

Atomic task / commit 3: `fix: reject unsupported bpps without fallback`

- Add typed unsupported-BPP and invalid-token errors.
- Ensure unknown BPP never falls back to static QR.
- Verification: `bun test test/errors.test.ts`

#### Sprint / PR 3: Add QR rendering and integrity tests

Atomic task / commit 1: `feat: render metro qr pngs`

- Render QR PNG bytes from typed payloads.
- Keep renderer options explicit and stable.
- Verification: `bun test test/render.test.ts`

Atomic task / commit 2: `test: add byte-preserving qr integrity coverage`

- Decode rendered QR images with byte-preserving decoder behavior.
- Cover MMMOCL byte-mode payloads with bytes above `0x7f`.
- Verification: `bun test test/integrity.test.ts`

Atomic task / commit 3: `test: cover all live bpp methodologies`

- Cover BMRCL, DMRC, MMMOCL, MMOPL, and MMRCL.
- Use synthetic provider-shaped fixtures only.
- Verification: `bun test`

#### Sprint / PR 4: Package for npm and private GitHub repo

Atomic task / commit 1: `chore: configure package exports and declarations`

- Configure ESM package exports and declaration output.
- Verification: `bun run build && bun run typecheck`

Atomic task / commit 2: `ci: add package validation workflow`

- Add GitHub Actions for Bun install, lint, typecheck, tests, and build.
- Verification: inspect workflow and run all local checks.

Atomic task / commit 3: `release: prepare 0.0.1`

- Confirm `package.json` version is `0.0.1`.
- Run `npm pack --dry-run`.
- Do not publish until explicitly approved.

## Remote Repo Plan

Create `oliver-chat/ondc-metro-qr-generator` as a private GitHub repository.

Do not create it as public. Do not flip it public during implementation.

After private repo creation:

1. Push local commits.
2. Create issue `feat: open-source ONDC metro QR generator`.
3. Link implementation PR or initial branch to the issue.
4. Keep PR draft/private until launch approval.
5. Publish `0.0.1` to npm only after explicit approval.

## Launch Messaging Draft

Short positioning:

> We are publishing the ONDC metro QR generation boundary we use in production:
> provider-specific QR policy, typed TypeScript implementation, and integrity
> tests that decode generated QR images back to the expected payload. AFC
> reliability is an ecosystem issue, and QR integrity should be inspectable by
> buyer apps, BPPs, ONDC, and metro teams.

Avoid claiming this proves every AFC failure is outside Oliver. The claim is
that Oliver's QR generation policy is explicit, reproducible, and open to
inspection.
