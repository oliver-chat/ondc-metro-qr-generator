import { describe, expect, test } from 'bun:test'
import { readBarcodes } from 'zxing-wasm/reader'
import { BppID, renderMetroQrPng } from '../src/index.js'

const textEncoder = new TextEncoder()

const mmoclBytes = new Uint8Array([0x4d, 0x4d, 0x4d, 0x4f, 0xff, 0x00, 0x7c])

const integrityFixtures = [
  {
    bppId: BppID.BMRCL,
    expectedBytes: textEncoder.encode(
      'synthetic-bmrcl-static-token-block#{66323ad2||0.0|0.0|}',
    ),
    nowMs: 1_714_567_890_000,
    token: 'synthetic-bmrcl-static-token-block',
  },
  {
    bppId: BppID.DMRC,
    expectedBytes: textEncoder.encode('synthetic-dmrc-static-token'),
    token: 'synthetic-dmrc-static-token',
  },
  {
    bppId: BppID.MMMOCL,
    expectedBytes: mmoclBytes,
    token: btoa(String.fromCharCode(...mmoclBytes)),
  },
  {
    bppId: BppID.MMOPL,
    expectedBytes: textEncoder.encode('synthetic-mmmopl-static-token'),
    token: 'synthetic-mmmopl-static-token',
  },
  {
    bppId: BppID.MMRCL,
    expectedBytes: textEncoder.encode('synthetic-mmmrcl-static-token'),
    token: 'synthetic-mmmrcl-static-token',
  },
] as const

describe('QR integrity', () => {
  for (const fixture of integrityFixtures) {
    test(`decodes generated QR bytes for ${fixture.bppId}`, async () => {
      const { png } = await renderMetroQrPng({
        bppId: fixture.bppId,
        token: fixture.token,
        ...('nowMs' in fixture ? { nowMs: fixture.nowMs } : {}),
      })

      const decodedBytes = await readSingleQrBytes(png)

      expect([...decodedBytes]).toEqual([...fixture.expectedBytes])
    })
  }
})

async function readSingleQrBytes(png: Uint8Array): Promise<Uint8Array> {
  const results = await readBarcodes(png, {
    formats: ['QRCode'],
    maxNumberOfSymbols: 1,
    textMode: 'Hex',
  })
  expect(results).toHaveLength(1)
  const [result] = results
  if (!result) throw new Error('expected one decoded QR result')
  return result.bytes
}
