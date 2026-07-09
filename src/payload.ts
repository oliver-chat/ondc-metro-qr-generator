import { InvalidMetroQrTokenError } from './errors.js'
import { assertMetroQrPolicy, type MetroQrPolicy } from './policies.js'

export interface MetroQrAuthorization {
  readonly type: string
  readonly token: string
}

export interface BuildMetroQrPayloadParameters {
  readonly authorization: MetroQrAuthorization
  readonly bppId: string | null | undefined
  readonly nowMs?: number
}

export type BuildMetroQrPayloadReturnType = MetroQrPayload

export type MetroQrPayload = MetroQrBytePayload | MetroQrTextPayload

export interface MetroQrBytePayload {
  readonly bytes: Uint8Array
  readonly kind: 'bytes'
  readonly policy: Extract<MetroQrPolicy, { readonly kind: 'base64-byte' }>
}

export interface MetroQrTextPayload {
  readonly kind: 'text'
  readonly policy: Exclude<MetroQrPolicy, { readonly kind: 'base64-byte' }>
  readonly text: string
}

/**
 * Builds the exact payload that should be encoded into an ONDC metro QR.
 *
 * @example
 * import { buildMetroQrPayload } from 'ondc-metro-qr-generator'
 *
 * const payload = buildMetroQrPayload({
 *   authorization: { type: 'QR', token: 'synthetic-provider-token' },
 *   bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
 * })
 */
export function buildMetroQrPayload({
  authorization,
  bppId,
  nowMs = Date.now(),
}: BuildMetroQrPayloadParameters): BuildMetroQrPayloadReturnType {
  assertQrAuthorization(authorization)
  const policy = assertMetroQrPolicy({ bppId })

  switch (policy.kind) {
    case 'base64-byte':
      return {
        bytes: decodeBase64Token(authorization.token),
        kind: 'bytes',
        policy,
      }
    case 'dynamic-timestamp':
      return {
        kind: 'text',
        policy,
        text: `${authorization.token}#${buildBmrclDynamicBlock({ nowMs })}`,
      }
    case 'static-opaque':
      return {
        kind: 'text',
        policy,
        text: authorization.token,
      }
  }
}

export interface BuildBmrclDynamicBlockParameters {
  readonly nowMs?: number
}

export type BuildBmrclDynamicBlockReturnType = string

/**
 * Builds the dynamic block BMRCL expects buyer apps to append to the static
 * authorization block.
 */
export function buildBmrclDynamicBlock({
  nowMs = Date.now(),
}: BuildBmrclDynamicBlockParameters = {}): BuildBmrclDynamicBlockReturnType {
  const epochHex = Math.floor(nowMs / 1000).toString(16)
  return `{${epochHex}||0.0|0.0|}`
}

function assertQrAuthorization(authorization: MetroQrAuthorization): void {
  if (authorization.type.trim().toUpperCase() !== 'QR') {
    throw new InvalidMetroQrTokenError({
      reason: `authorization type must be QR, received ${authorization.type}`,
    })
  }

  if (authorization.token.trim().length === 0) {
    throw new InvalidMetroQrTokenError({
      reason: 'authorization token is empty',
    })
  }
}

function decodeBase64Token(token: string): Uint8Array {
  const normalizedToken = token.replace(/\s/g, '')
  try {
    return Uint8Array.from(atob(normalizedToken), (character) =>
      character.charCodeAt(0),
    )
  } catch {
    throw new InvalidMetroQrTokenError({
      reason: 'base64 byte-mode token could not be decoded',
    })
  }
}
