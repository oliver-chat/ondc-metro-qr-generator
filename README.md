# ondc-metro-qr-generator

Typed TypeScript utilities for generating ONDC metro ticket QR payloads and QR
PNG images across supported metro BPPs.

Generates QR payloads and pure QR PNGs for these metro BPPs by adhering to
their QR generation guidelines:

- BMRCL
- DMRC
- MMMOCL
- MMOPL
- MMRCL

## Install

```sh
bun add ondc-metro-qr-generator
# or
npm install ondc-metro-qr-generator
```

## Usage

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

const payload = MetroQR.dmrc({
  token: 'qr-token',
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

## Supported Policies

| BPP | Policy |
| --- | --- |
| BMRCL | Dynamic timestamp QR |
| DMRC | Static QR |
| MMMOCL | Base64 decoded byte-mode QR |
| MMOPL | Static QR |
| MMRCL | Static QR |

Supported BPP ids are the `BppID` constants defined in
[`src/policies.ts`](./src/policies.ts#L6-L12). Those are the only BPPs this
package supports.

## Provider Policy Documents

- [BMRCL QR ticket generation process](./docs/provider-policies/BMRCL-QR-ticket-generation-process.pdf)
- [MMMOCL QR ticket generation process](./docs/provider-policies/MMMOCL-QR-ticket-generation-process.pdf)

## Examples

### High-Level Provider API

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

const bmrclPayload = MetroQR.bmrcl({
  nowMs: Date.now(),
  token: 'qr-token',
})
const dmrcPayload = MetroQR.dmrc({
  token: 'qr-token',
})
const mmmoclPayload = MetroQR.mmmocl({
  token: 'TU1NT/8AfA==',
})
const mmoplPayload = MetroQR.mmopl({
  token: 'qr-token',
})
const mmrclPayload = MetroQR.mmrcl({
  token: 'qr-token',
})
```

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

const payload = MetroQR.dmrc({
  token: 'qr-token',
})
const { png } = await MetroQR.renderPng({
  payload,
  qrOptions: {
    width: 512,
  },
})
```

### BMRCL Offline Refresh

```ts
import { MetroQR } from 'ondc-metro-qr-generator'

// Cache the BMRCL QR token from the confirmed ticket while online.
const cachedBmrclQrToken = await ticketStore.get('bmrcl-qr-token')

async function refreshBmrclQrPng({ nowMs = Date.now() } = {}) {
  const payload = MetroQR.bmrcl({
    nowMs,
    token: cachedBmrclQrToken,
  })

  return MetroQR.renderPng({
    payload,
    qrOptions: {
      width: 512,
    },
  })
}

// The provider token stays cached; the BMRCL dynamic QR block refreshes locally.
const { png } = await refreshBmrclQrPng()
setInterval(refreshBmrclQrPng, 30_000)
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
  token: 'qr-token',
  width: 512,
})
```

```ts
import { BppID, getMetroQrPolicy } from 'ondc-metro-qr-generator'

const policy = getMetroQrPolicy({ bppId: BppID.DMRC })
```

## Contributing

Contributions are welcome for additional language packages, QR integrity tests,
documentation, and BPP QR generation policies. We especially encourage BPPs to
add their respective policy documents and methodologies for Pune, Chennai,
Kochi, Nagpur, and other ONDC metro networks.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution requirements.

## Acknowledgements

This package exists for the [ONDC](https://ondc.org/) metro ecosystem and uses
provider QR policy documents shared by [Sequel String](https://www.sequelstring.com/).

Runtime and validation dependencies include
[node-qrcode](https://github.com/soldair/node-qrcode) for QR PNG generation and
[zxing-wasm](https://github.com/Sec-ant/zxing-wasm) for QR decode integrity
tests. The package is built with [Bun](https://bun.sh/),
[TypeScript](https://www.typescriptlang.org/), [Biome](https://biomejs.dev/),
[publint](https://publint.dev/), and
[Are the Types Wrong?](https://arethetypeswrong.github.io/).

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
