import { describe, expect, test } from 'bun:test'
import { renderMetroQrPng } from '../src/index.js'

describe('metro QR PNG rendering', () => {
  test('renders static opaque payloads as PNG bytes', async () => {
    const { payload, png } = await renderMetroQrPng({
      authorization: { type: 'QR', token: 'synthetic-static-token' },
      bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
    })

    expect(payload).toMatchObject({
      kind: 'text',
      policy: { kind: 'static-opaque', operator: 'DMRC' },
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
      authorization: {
        type: 'QR',
        token: btoa(String.fromCharCode(...sourceBytes)),
      },
      bppId: 'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
    })

    expect(payload.kind).toBe('bytes')
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.byteLength).toBeGreaterThan(100)
  })

  test('renders BMRCL with caller-controlled dynamic timestamp', async () => {
    const first = await renderMetroQrPng({
      authorization: {
        type: 'QR',
        token: 'synthetic-bmrcl-static-authorization-block',
      },
      bppId: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
      nowMs: 1_714_567_890_000,
    })
    const second = await renderMetroQrPng({
      authorization: {
        type: 'QR',
        token: 'synthetic-bmrcl-static-authorization-block',
      },
      bppId: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
      nowMs: 1_714_567_920_000,
    })

    expect(first.payload).toMatchObject({
      kind: 'text',
      text: 'synthetic-bmrcl-static-authorization-block#{66323ad2||0.0|0.0|}',
    })
    expect(second.payload).toMatchObject({
      kind: 'text',
      text: 'synthetic-bmrcl-static-authorization-block#{66323af0||0.0|0.0|}',
    })
    expect(first.png).not.toEqual(second.png)
  })
})
