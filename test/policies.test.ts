import { describe, expect, test } from 'bun:test'
import {
  assertMetroQrPolicy,
  BppID,
  getMetroQrPolicy,
  isKnownMetroQrBpp,
  type KnownBppId,
  type MetroQrPolicyKind,
  metroQrPolicies,
  PreprodBppID,
  UnsupportedMetroBppError,
} from '../src/index.js'

describe('metro QR policies', () => {
  test('covers every live BPP with exactly one policy', () => {
    expect(metroQrPolicies.map((policy) => policy.bppId)).toEqual([
      BppID.BMRCL,
      BppID.DMRC,
      BppID.MMMOCL,
      BppID.MMOPL,
      BppID.MMRCL,
    ])
    expect(new Set(metroQrPolicies.map((policy) => policy.bppId)).size).toBe(
      metroQrPolicies.length,
    )
  })

  // Regression test for https://github.com/oliver-chat/ondc-metro-qr-generator/issues/2: preprod ids resolve through the package policy table.
  test('resolves exact preprod aliases to their production policies', () => {
    const environmentPairs = [
      [BppID.BMRCL, PreprodBppID.BMRCL],
      [BppID.DMRC, PreprodBppID.DMRC],
      [BppID.MMMOCL, PreprodBppID.MMMOCL],
    ] as const

    for (const [productionBppId, preprodBppId] of environmentPairs) {
      expect(getMetroQrPolicy({ bppId: preprodBppId })).toBe(
        getMetroQrPolicy({ bppId: productionBppId }),
      )
    }
  })

  test('assigns the expected methodology to each BPP', () => {
    expect(
      metroQrPolicies.map((policy) => [policy.bppId, policy.kind]),
    ).toEqual([
      [BppID.BMRCL, 'dynamic-timestamp'],
      [BppID.DMRC, 'static'],
      [BppID.MMMOCL, 'base64-byte'],
      [BppID.MMOPL, 'static'],
      [BppID.MMRCL, 'static'],
    ])
  })

  test('looks up policy by normalized BPP id', () => {
    expect(
      getMetroQrPolicy({
        bppId: ' ONDC-PROD-BMRCL.SEQUELSTRING.COM/SELLER/BMRCL/ ',
      }),
    ).toEqual({
      bppAliases: [PreprodBppID.BMRCL],
      bppId: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
      cityCode: 'std:080',
      kind: 'dynamic-timestamp',
      refreshSeconds: 30,
    })
  })

  test('does not treat unknown BPP ids as supported', () => {
    expect(isKnownMetroQrBpp({ bppId: null })).toBe(false)
    expect(
      isKnownMetroQrBpp({
        bppId: 'ondc-prod-unknown.example/seller/metro',
      }),
    ).toBe(false)
    expect(() =>
      assertMetroQrPolicy({
        bppId: 'ondc-preprod.example/seller/bmrcl',
      }),
    ).toThrow(UnsupportedMetroBppError)
  })

  test('derives literal public types from the canonical table', () => {
    const knownBppId: KnownBppId = PreprodBppID.MMMOCL
    const kind: MetroQrPolicyKind = 'base64-byte'

    expect({ knownBppId, kind }).toEqual({
      knownBppId: PreprodBppID.MMMOCL,
      kind: 'base64-byte',
    })
  })
})
