# ONDC Metro QR Generator Agent Instructions

This repository is a standalone public-library candidate. Keep it independent
from Oliver runtime code.

## Hard Boundaries

- The GitHub repository must remain private until explicit launch approval.
- Do not commit production QR tokens, ticket ids, payment ids, phone numbers, or
  raw production payloads.
- Use synthetic provider-shaped fixtures only.
- Do not add Oliver workspace dependencies.
- Do not add fallback behavior for unsupported BPPs.

## TypeScript Bar

- Use strict TypeScript for all source and tests.
- Avoid `any` and broad public `Record<string, unknown>` inputs.
- Keep public types explicit and exported from stable modules.
- Prefer discriminated unions over optional mode flags.
- Prefer pure functions over classes.
- Use type-only imports where possible.
- Use `.js` extensions for relative ESM imports in source files.

## Library API Bar

- Keep `src/index.ts` as the explicit public API surface.
- Keep provider policy in one canonical table.
- Keep QR rendering separate from BPP policy and payload construction.
- Public functions should have named parameter and return types.
- Public exports should have concise JSDoc.

## Review Bar

- No file should approach 1000 lines.
- Do not add thin wrappers that do not simplify the caller.
- Do not hide invariants with casts, optionality, or permissive inputs.
- Prefer deleting concepts over centralizing unnecessary complexity.

## Required Checks

Run before publish or PR review:

```sh
bun run lint
bun run typecheck
bun test
bun run build
npm pack --dry-run
```

