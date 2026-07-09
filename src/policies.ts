import { UnsupportedMetroBppError } from './errors.js'

/**
 * Supported ONDC metro BPP ids with explicit QR generation policies.
 */
export const BppID = {
  BMRCL: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
  DMRC: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
  MMMOCL: 'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
  MMOPL: 'ondc-prod-mmmopl.sequelstring.com/seller/mmmopl',
  MMRCL: 'ondc-prod-mmmrcl.sequelstring.com/seller/mmmrcl',
} as const

/**
 * Canonical provider policy table used by payload generation and rendering.
 */
export const metroQrPolicies = [
  {
    bppId: BppID.BMRCL,
    cityCode: 'std:080',
    kind: 'dynamic-timestamp',
    operator: 'BMRCL',
    refreshSeconds: 30,
  },
  {
    bppId: BppID.DMRC,
    cityCode: 'std:011',
    kind: 'static-opaque',
    operator: 'DMRC',
  },
  {
    bppId: BppID.MMMOCL,
    cityCode: 'std:022',
    kind: 'base64-byte',
    operator: 'MMMOCL',
  },
  {
    bppId: BppID.MMOPL,
    cityCode: 'std:022',
    kind: 'static-opaque',
    operator: 'MMOPL',
  },
  {
    bppId: BppID.MMRCL,
    cityCode: 'std:022',
    kind: 'static-opaque',
    operator: 'MMRCL',
  },
] as const

export type MetroQrPolicy = (typeof metroQrPolicies)[number]
export type BppID = (typeof BppID)[keyof typeof BppID]
export type KnownBppId = BppID
export type MetroQrPolicyKind = MetroQrPolicy['kind']
export type MetroQrPolicyOperator = MetroQrPolicy['operator']

export interface AssertMetroQrPolicyParameters {
  readonly bppId: string | null | undefined
}

export type AssertMetroQrPolicyReturnType = MetroQrPolicy

/**
 * Returns the supported ONDC metro QR policy for a BPP id, or throws when the
 * BPP does not have an explicit policy.
 */
export function assertMetroQrPolicy({
  bppId,
}: AssertMetroQrPolicyParameters): AssertMetroQrPolicyReturnType {
  const policy = getMetroQrPolicy({ bppId })
  if (!policy) throw new UnsupportedMetroBppError({ bppId })
  return policy
}

export interface GetMetroQrPolicyParameters {
  readonly bppId: string | null | undefined
}

export type GetMetroQrPolicyReturnType = MetroQrPolicy | null

/**
 * Returns the supported ONDC metro QR policy for a BPP id.
 *
 * @example
 * import { BppID, getMetroQrPolicy } from 'ondc-metro-qr-generator'
 *
 * const policy = getMetroQrPolicy({
 *   bppId: BppID.DMRC,
 * })
 */
export function getMetroQrPolicy({
  bppId,
}: GetMetroQrPolicyParameters): GetMetroQrPolicyReturnType {
  const normalizedBppId = normalizeBppId(bppId)
  if (!normalizedBppId) return null
  return (
    metroQrPolicies.find(
      (policy) => normalizeBppId(policy.bppId) === normalizedBppId,
    ) ?? null
  )
}

export interface IsKnownMetroQrBppParameters {
  readonly bppId: string | null | undefined
}

export type IsKnownMetroQrBppReturnType = boolean

/**
 * Returns true when a BPP id has an explicit QR policy in this package.
 */
export function isKnownMetroQrBpp({
  bppId,
}: IsKnownMetroQrBppParameters): IsKnownMetroQrBppReturnType {
  return getMetroQrPolicy({ bppId }) !== null
}

function normalizeBppId(value: string | null | undefined): string | null {
  const trimmed = value?.trim().replace(/\/+$/, '').toLowerCase()
  return trimmed && trimmed.length > 0 ? trimmed : null
}
