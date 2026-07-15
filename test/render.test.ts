import { describe, expect, test } from 'bun:test'
import { BppID, renderMetroQrPng } from '../src/index.js'

describe('metro QR PNG rendering', () => {
  // Regression test for https://github.com/oliver-chat/ondc-metro-qr-generator/issues/10: server runtimes explicitly use the qrcode server implementation.
  test('renders static payloads as PNG bytes', async () => {
    const { payload, png } = await renderMetroQrPng({
      bppId: BppID.DMRC,
      token: 'synthetic-static-token',
    })

    expect(payload).toMatchObject({
      kind: 'text',
      policy: { bppId: BppID.DMRC, kind: 'static' },
      text: 'synthetic-static-token',
    })
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.byteLength).toBeGreaterThan(100)
  })

  test('renders MMMOCL byte-mode payloads as PNG bytes', async () => {
    const sourceBytes = new Uint8Array([
      0x4d, 0x4d, 0x4d, 0x4f, 0xff, 0x00, 0x7c,
    ])
    const { payload, png } = await renderMetroQrPng({
      bppId: BppID.MMMOCL,
      token: btoa(String.fromCharCode(...sourceBytes)),
    })

    expect(payload.kind).toBe('bytes')
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.byteLength).toBeGreaterThan(100)
  })

  test('renders BMRCL with caller-controlled dynamic timestamp', async () => {
    const first = await renderMetroQrPng({
      bppId: BppID.BMRCL,
      nowMs: 1_714_567_890_000,
      token: 'synthetic-bmrcl-static-token-block',
    })
    const second = await renderMetroQrPng({
      bppId: BppID.BMRCL,
      nowMs: 1_714_567_920_000,
      token: 'synthetic-bmrcl-static-token-block',
    })

    expect(first.payload).toMatchObject({
      kind: 'text',
      text: 'synthetic-bmrcl-static-token-block#{66323ad2||0.0|0.0|}',
    })
    expect(second.payload).toMatchObject({
      kind: 'text',
      text: 'synthetic-bmrcl-static-token-block#{66323af0||0.0|0.0|}',
    })
    expect(first.png).not.toEqual(second.png)
  })
})
