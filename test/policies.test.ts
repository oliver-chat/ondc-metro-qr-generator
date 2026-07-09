import { describe, expect, test } from 'bun:test'
import {
  BppID,
  getMetroQrPolicy,
  isKnownMetroQrBpp,
  type KnownBppId,
  type MetroQrPolicyKind,
  metroQrPolicies,
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

  test('assigns the expected methodology to each BPP', () => {
    expect(
      metroQrPolicies.map((policy) => [policy.bppId, policy.kind]),
    ).toEqual([
      [BppID.BMRCL, 'dynamic-timestamp'],
      [BppID.DMRC, 'static-opaque'],
      [BppID.MMMOCL, 'base64-byte'],
      [BppID.MMOPL, 'static-opaque'],
      [BppID.MMRCL, 'static-opaque'],
    ])
  })

  test('looks up policy by normalized BPP id', () => {
    expect(
      getMetroQrPolicy({
        bppId: ' ONDC-PROD-BMRCL.SEQUELSTRING.COM/SELLER/BMRCL/ ',
      }),
    ).toEqual({
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
  })

  test('derives literal public types from the canonical table', () => {
    const knownBppId: KnownBppId = BppID.MMMOCL
    const kind: MetroQrPolicyKind = 'base64-byte'

    expect({ knownBppId, kind }).toEqual({
      knownBppId: BppID.MMMOCL,
      kind: 'base64-byte',
    })
  })
})
