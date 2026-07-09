import { describe, expect, test } from 'bun:test'
import { BppID, MetroQR } from '../src/index.js'

describe('MetroQR provider API', () => {
  test('builds BMRCL payload without passing bppId', () => {
    const payload = MetroQR.bmrcl({
      nowMs: 1_714_567_890_000,
      token: 'synthetic-bmrcl-static-token-block',
    })

    expect(payload).toMatchObject({
      kind: 'text',
      policy: { bppId: BppID.BMRCL, operator: 'BMRCL' },
      text: 'synthetic-bmrcl-static-token-block#{66323ad2||0.0|0.0|}',
    })
  })

  test('builds MMMOCL byte-mode payloads without passing bppId', () => {
    const sourceBytes = new Uint8Array([
      0x4d, 0x4d, 0x4d, 0x4f, 0xff, 0x00, 0x7c,
    ])
    const payload = MetroQR.mmmocl({
      token: btoa(String.fromCharCode(...sourceBytes)),
    })

    expect(payload.kind).toBe('bytes')
    if (payload.kind !== 'bytes') throw new Error('expected bytes payload')
    expect(payload.policy.bppId).toBe(BppID.MMMOCL)
    expect([...payload.bytes]).toEqual([...sourceBytes])
  })

  test('builds static provider payloads without passing bppId', () => {
    expect(MetroQR.dmrc({ token: 'synthetic-dmrc-token' })).toMatchObject({
      policy: { bppId: BppID.DMRC, operator: 'DMRC' },
      text: 'synthetic-dmrc-token',
    })
    expect(MetroQR.mmopl({ token: 'synthetic-mmopl-token' })).toMatchObject({
      policy: { bppId: BppID.MMOPL, operator: 'MMOPL' },
      text: 'synthetic-mmopl-token',
    })
    expect(MetroQR.mmrcl({ token: 'synthetic-mmrcl-token' })).toMatchObject({
      policy: { bppId: BppID.MMRCL, operator: 'MMRCL' },
      text: 'synthetic-mmrcl-token',
    })
  })

  test('renders a pre-built payload as PNG bytes', async () => {
    const payload = MetroQR.dmrc({ token: 'synthetic-dmrc-token' })
    const { png } = await MetroQR.renderPng({ payload })

    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.byteLength).toBeGreaterThan(100)
  })

  test('renders with nested QR options', async () => {
    const payload = MetroQR.dmrc({ token: 'synthetic-dmrc-token' })
    const { png } = await MetroQR.renderPng({
      payload,
      qrOptions: {
        errorCorrectionLevel: 'Q',
        margin: 2,
        width: 256,
      },
    })

    expect(pngWidth(png)).toBe(256)
  })
})

function pngWidth(png: Uint8Array): number {
  return new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(16)
}
