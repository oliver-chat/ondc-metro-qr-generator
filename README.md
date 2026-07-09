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
import { MetroQR } from 'ondc-metro-qr-generator'

const payload = MetroQR.dmrc({
  token: 'synthetic-provider-token',
})
const { png } = await MetroQR.renderPng({
  payload,
  qrOptions: {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  },
})
```

Supported BPP ids are the `BppID` constants defined in
[`src/policies.ts`](./src/policies.ts#L6-L12). Those are the only BPPs this
package supports.

## Public Methods

### High-Level Provider API

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

const bmrclPayload = MetroQR.bmrcl({
  nowMs: Date.now(),
  token: 'synthetic-provider-token',
})
const dmrcPayload = MetroQR.dmrc({
  token: 'synthetic-provider-token',
})
const mmmoclPayload = MetroQR.mmmocl({
  token: 'TU1NT/8AfA==',
})
const mmoplPayload = MetroQR.mmopl({
  token: 'synthetic-provider-token',
})
const mmrclPayload = MetroQR.mmrcl({
  token: 'synthetic-provider-token',
})
```

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

const payload = MetroQR.dmrc({
  token: 'synthetic-provider-token',
})
const { png } = await MetroQR.renderPng({
  payload,
  qrOptions: {
    width: 512,
  },
})
```

### Low-Level API

```ts
import { BppID, buildMetroQrPayload } from 'ondc-metro-qr-generator'

const payload = buildMetroQrPayload({
  bppId: BppID.MMMOCL,
  token: 'TU1NT/8AfA==',
})
```

```ts
import { BppID, renderMetroQrPng } from 'ondc-metro-qr-generator'

const { png } = await renderMetroQrPng({
  bppId: BppID.BMRCL,
  token: 'synthetic-provider-token',
  width: 512,
})
```

```ts
import { BppID, getMetroQrPolicy } from 'ondc-metro-qr-generator'

const policy = getMetroQrPolicy({ bppId: BppID.DMRC })
```

## Guarantees

- Unknown BPPs are rejected. They do not fall back to static QR behavior.
- MMMOCL base64 payloads are encoded as raw QR byte segments.
- BMRCL dynamic QR payloads include a generated timestamp block.
- Public fixtures are synthetic and do not contain production ticket data.
