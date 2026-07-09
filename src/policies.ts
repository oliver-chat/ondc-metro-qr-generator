export const metroQrPolicies = [
  {
    bppId: 'ondc-prod-bmrcl.sequelstring.com/seller/bmrcl',
    cityCode: 'std:080',
    kind: 'dynamic-timestamp',
    operator: 'BMRCL',
    refreshSeconds: 30,
  },
  {
    bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
    cityCode: 'std:011',
    kind: 'static-opaque',
    operator: 'DMRC',
  },
  {
    bppId: 'ondc-prod-mmmocl.sequelstring.com/seller/mmmocl',
    cityCode: 'std:022',
    kind: 'base64-byte',
    operator: 'MMMOCL',
  },
  {
    bppId: 'ondc-prod-mmmopl.sequelstring.com/seller/mmmopl',
    cityCode: 'std:022',
    kind: 'static-opaque',
    operator: 'MMOPL',
  },
  {
    bppId: 'ondc-prod-mmmrcl.sequelstring.com/seller/mmmrcl',
    cityCode: 'std:022',
    kind: 'static-opaque',
    operator: 'MMRCL',
  },
] as const

export type MetroQrPolicy = (typeof metroQrPolicies)[number]
export type KnownBppId = MetroQrPolicy['bppId']
export type MetroQrPolicyKind = MetroQrPolicy['kind']
export type MetroQrPolicyOperator = MetroQrPolicy['operator']

export interface GetMetroQrPolicyParameters {
  readonly bppId: string | null | undefined
}

export type GetMetroQrPolicyReturnType = MetroQrPolicy | null

/**
 * Returns the supported ONDC metro QR policy for a BPP id.
 *
 * @example
 * import { getMetroQrPolicy } from 'ondc-metro-qr-generator'
 *
 * const policy = getMetroQrPolicy({
 *   bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
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
