import { describe, expect, test } from 'bun:test'
import {
  BppID,
  buildBmrclDynamicBlock,
  buildMetroQrPayload,
  InvalidMetroQrTokenError,
  UnsupportedMetroBppError,
} from '../src/index.js'

describe('metro QR payload generation', () => {
  test('builds static opaque payloads without modifying token text', () => {
    expect(
      buildMetroQrPayload({
        bppId: BppID.DMRC,
        token: 'synthetic-static-token',
      }),
    ).toMatchObject({
      kind: 'text',
      policy: {
        bppId: BppID.DMRC,
        kind: 'static-opaque',
        operator: 'DMRC',
      },
      text: 'synthetic-static-token',
    })
  })

  test('decodes MMMOCL base64 token to raw byte-mode payload', () => {
    const sourceBytes = new Uint8Array([
      0x4d, 0x4d, 0x4d, 0x4f, 0xff, 0x00, 0x7c,
    ])
    const token = btoa(String.fromCharCode(...sourceBytes))

    const payload = buildMetroQrPayload({
      bppId: BppID.MMMOCL,
      token,
    })

    expect(payload.kind).toBe('bytes')
    if (payload.kind !== 'bytes') throw new Error('expected bytes payload')
    expect(payload.policy.operator).toBe('MMMOCL')
    expect([...payload.bytes]).toEqual([...sourceBytes])
  })

  test('appends BMRCL dynamic timestamp block', () => {
    expect(buildBmrclDynamicBlock({ nowMs: 1_714_567_890_000 })).toBe(
      '{66323ad2||0.0|0.0|}',
    )
    expect(
      buildMetroQrPayload({
        bppId: BppID.BMRCL,
        nowMs: 1_714_567_890_000,
        token: 'synthetic-bmrcl-static-token-block',
      }),
    ).toMatchObject({
      kind: 'text',
      policy: {
        kind: 'dynamic-timestamp',
        operator: 'BMRCL',
        refreshSeconds: 30,
      },
      text: 'synthetic-bmrcl-static-token-block#{66323ad2||0.0|0.0|}',
    })
  })

  test('rejects unsupported BPP ids without falling back to static QR', () => {
    expect(() =>
      buildMetroQrPayload({
        // @ts-expect-error Runtime boundary rejects unsupported JavaScript callers.
        bppId: 'ondc-prod-unknown.example/seller/metro',
        token: 'synthetic-token',
      }),
    ).toThrow(UnsupportedMetroBppError)
  })

  test('rejects empty tokens', () => {
    expect(() =>
      buildMetroQrPayload({
        bppId: BppID.DMRC,
        token: '   ',
      }),
    ).toThrow(InvalidMetroQrTokenError)
  })
})
