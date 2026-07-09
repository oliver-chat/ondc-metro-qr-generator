import { describe, expect, test } from 'bun:test'
import {
  getMetroQrPolicy,
  isKnownMetroQrBpp,
  type KnownBppId,
  type MetroQrPolicyKind,
  type MetroQrPolicyOperator,
  metroQrPolicies,
} from '../src/index.js'

describe('metro QR policies', () => {
  test('covers every live BPP with exactly one policy', () => {
    expect(metroQrPolicies.map((policy) => policy.bppId)).toEqual([
      'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
      'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
      'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
      'ondc-prod-mmmopl.sequelstring.com/seller/mmmopl',
      'ondc-prod-mmmrcl.sequelstring.com/seller/mmmrcl',
    ])
    expect(new Set(metroQrPolicies.map((policy) => policy.bppId)).size).toBe(
      metroQrPolicies.length,
    )
  })

  test('assigns the expected methodology to each operator', () => {
    expect(
      metroQrPolicies.map((policy) => [policy.operator, policy.kind]),
    ).toEqual([
      ['BMRCL', 'dynamic-timestamp'],
      ['DMRC', 'static-opaque'],
      ['MMMOCL', 'base64-byte'],
      ['MMOPL', 'static-opaque'],
      ['MMRCL', 'static-opaque'],
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
      operator: 'BMRCL',
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
    const knownBppId: KnownBppId =
      'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl'
    const kind: MetroQrPolicyKind = 'base64-byte'
    const operator: MetroQrPolicyOperator = 'MMMOCL'

    expect({ knownBppId, kind, operator }).toEqual({
      knownBppId: 'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
      kind: 'base64-byte',
      operator: 'MMMOCL',
    })
  })
})
