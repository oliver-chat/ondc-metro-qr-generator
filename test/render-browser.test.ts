import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createCanvas } from '@napi-rs/canvas'
import { readBarcodes } from 'zxing-wasm/reader'
import { BppID, renderMetroQrPng } from '../src/index.browser.js'

const documentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'document',
)

describe('browser QR PNG rendering', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        createElement: () => createCanvas(1, 1),
      },
    })
  })

  afterAll(() => {
    if (documentDescriptor) {
      Object.defineProperty(globalThis, 'document', documentDescriptor)
      return
    }
    Reflect.deleteProperty(globalThis, 'document')
  })

  // Regression test for https://github.com/oliver-chat/ondc-metro-qr-generator/issues/10: the browser entry renders without the Node-only toBuffer API.
  test('renders decodable PNG bytes with the browser qrcode implementation', async () => {
    const token = 'synthetic-browser-static-token'
    const { png } = await renderMetroQrPng({
      bppId: BppID.DMRC,
      token,
    })

    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(new TextDecoder().decode(await readSingleQrBytes(png))).toBe(token)
  })
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
