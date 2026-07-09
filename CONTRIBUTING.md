# Contributing

This project welcomes contributions that make ONDC metro QR generation easier to
implement, verify, and compare across buyer apps and BPPs.

## Ways To Contribute

- Add QR generation policies for more ONDC metro BPPs.
- Add language packages or ports for mobile and backend stacks.
- Improve QR integrity tests, fixtures, policy documentation, and examples.
- Correct or clarify existing provider policy behavior.

## BPP Policy Contributions

BPPs and metro ecosystem teams are encouraged to add their respective QR
generation policies and methodologies. We especially welcome policy
contributions for:

- Pune Metro
- Chennai Metro
- Kochi Metro
- Nagpur Metro

A BPP policy contribution should include:

- BPP name and BPP ID.
- Official QR generation methodology or policy document.
- Payload construction rules, including text mode, byte mode, encoding, dynamic
  fields, timestamps, separators, and refresh windows where applicable.
- QR rendering requirements, including error correction level, margin, width, or
  scanner-specific constraints where applicable.
- Synthetic or fully redacted QR token examples.
- Expected payload bytes or string output for each example.
- QR integrity tests that render the QR and decode it back to the expected
  payload.

Do not include production QR tokens, ticket ids, payment ids, phone numbers,
passenger names, or raw user data.

## Language Package Contributions

We welcome packages and ports for other languages and platforms, including:

- Swift
- Objective-C
- Java
- Kotlin

Language packages should match the canonical policy behavior in this TypeScript
package and include equivalent QR integrity tests. If a port is better as a
separate package or repository, open an issue with the proposed package name,
API shape, target platform, and test strategy before implementation.

## Quality Bar

- Keep behavior explicit and policy-driven.
- Do not add fallback behavior for unsupported BPPs.
- Use synthetic fixtures only.
- Include tests for every new policy or rendering behavior.
- Keep public APIs small, typed, and documented.
