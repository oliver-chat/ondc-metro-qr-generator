# ondc-metro-qr-generator

Typed TypeScript utilities for generating ONDC metro ticket QR payloads and QR
PNG images across supported metro BPPs.

This package is being prepared privately first. Do not treat this repository as
public launch material until Oliver explicitly approves publication.

## Supported Policies

| BPP | Policy |
| --- | --- |
| BMRCL | Dynamic timestamp QR |
| DMRC | Static opaque QR |
| MMMOCL | Base64 decoded byte-mode QR |
| MMOPL | Static opaque QR |
| MMRCL | Static opaque QR |

## Install

```sh
bun add ondc-metro-qr-generator
```

## Usage

```ts
import { renderMetroQrPng } from 'ondc-metro-qr-generator'

const { png } = await renderMetroQrPng({
  authorization: {
    type: 'QR',
    token: 'synthetic-provider-token',
  },
  bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
})
```

## Guarantees

- Unknown BPPs are rejected. They do not fall back to static QR behavior.
- MMMOCL base64 payloads are encoded as raw QR byte segments.
- BMRCL dynamic QR payloads include a generated timestamp block.
- Public fixtures are synthetic and do not contain production ticket data.

