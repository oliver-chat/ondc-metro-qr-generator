import { describe, expect, test } from 'bun:test'
import {
  BppID,
  buildBmrclDynamicBlock,
  buildMetroQrPayload,
  InvalidMetroQrTokenError,
  UnsupportedMetroBppError,
} from '../src/index.js'

describe('metro QR payload generation', () => {
  test('builds static payloads without modifying token text', () => {
    expect(
      buildMetroQrPayload({
        bppId: BppID.DMRC,
        token: 'synthetic-static-token',
      }),
    ).toMatchObject({
      kind: 'text',
      policy: {
        bppId: BppID.DMRC,
        kind: 'static',
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
    expect(payload.policy.bppId).toBe(BppID.MMMOCL)
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
        bppId: BppID.BMRCL,
        kind: 'dynamic-timestamp',
        refreshSeconds: 30,
      },
      text: 'synthetic-bmrcl-static-token-block#{66323ad2||0.0|0.0|}',
    })
  })

  // Regression test for https://github.com/oliver-chat/ondc-metro-qr-generator/issues/2: payload generation accepts the original preprod callback id.
  test('builds payloads directly from exact preprod BPP ids', () => {
    expect(
      buildMetroQrPayload({
        bppId: BppID.preprod.DMRC,
        token: 'synthetic-static-token',
      }),
    ).toEqual(
      buildMetroQrPayload({
        bppId: BppID.DMRC,
        token: 'synthetic-static-token',
      }),
    )
  })

  // Regression test for https://github.com/oliver-chat/ondc-metro-qr-generator/issues/2: unknown ids never inherit a known provider policy.
  test('rejects unsupported BPP ids without falling back to static QR', () => {
    expect(() =>
      buildMetroQrPayload({
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
