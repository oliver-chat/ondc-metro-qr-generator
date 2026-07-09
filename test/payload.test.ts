import { describe, expect, test } from 'bun:test'
import {
  buildBmrclDynamicBlock,
  buildMetroQrPayload,
  InvalidMetroQrTokenError,
  UnsupportedMetroBppError,
} from '../src/index.js'

describe('metro QR payload generation', () => {
  test('builds static opaque payloads without modifying token text', () => {
    expect(
      buildMetroQrPayload({
        authorization: { type: 'QR', token: 'synthetic-static-token' },
        bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
      }),
    ).toMatchObject({
      kind: 'text',
      policy: {
        bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
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
      authorization: { type: 'QR', token },
      bppId: 'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
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
        authorization: {
          type: 'QR',
          token: 'synthetic-bmrcl-static-authorization-block',
        },
        bppId: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
        nowMs: 1_714_567_890_000,
      }),
    ).toMatchObject({
      kind: 'text',
      policy: {
        kind: 'dynamic-timestamp',
        operator: 'BMRCL',
        refreshSeconds: 30,
      },
      text: 'synthetic-bmrcl-static-authorization-block#{66323ad2||0.0|0.0|}',
    })
  })

  test('rejects unsupported BPP ids without falling back to static QR', () => {
    expect(() =>
      buildMetroQrPayload({
        authorization: { type: 'QR', token: 'synthetic-token' },
        bppId: 'ondc-prod-unknown.example/seller/metro',
      }),
    ).toThrow(UnsupportedMetroBppError)
  })

  test('rejects non-QR authorization and empty tokens', () => {
    expect(() =>
      buildMetroQrPayload({
        authorization: { type: 'BARCODE', token: 'synthetic-token' },
        bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
      }),
    ).toThrow(InvalidMetroQrTokenError)

    expect(() =>
      buildMetroQrPayload({
        authorization: { type: 'QR', token: '   ' },
        bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
      }),
    ).toThrow(InvalidMetroQrTokenError)
  })
})
