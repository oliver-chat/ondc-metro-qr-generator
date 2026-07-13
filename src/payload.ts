import { InvalidMetroQrTokenError } from './errors.js'
import { assertMetroQrPolicy, type MetroQrPolicy } from './policies.js'

export interface BuildMetroQrPayloadParameters {
  readonly bppId: string | null | undefined
  readonly nowMs?: number
  readonly token: string
}

export type BuildMetroQrPayloadReturnType = MetroQrPayload

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

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
 * import { BppID, buildMetroQrPayload } from 'ondc-metro-qr-generator'
 *
 * const payload = buildMetroQrPayload({
 *   bppId: BppID.DMRC,
 *   token: 'qr-token',
 * })
 */
export function buildMetroQrPayload({
  bppId,
  nowMs = Date.now(),
  token,
}: BuildMetroQrPayloadParameters): BuildMetroQrPayloadReturnType {
  assertQrToken(token)
  const policy = assertMetroQrPolicy({ bppId })

  switch (policy.kind) {
    case 'base64-byte':
      return {
        bytes: decodeBase64Token(token),
        kind: 'bytes',
        policy,
      }
    case 'dynamic-timestamp':
      return {
        kind: 'text',
        policy,
        text: `${token}#${buildBmrclDynamicBlock({ nowMs })}`,
      }
    case 'static':
      return {
        kind: 'text',
        policy,
        text: token,
      }
  }
}

export interface BuildBmrclDynamicBlockParameters {
  readonly nowMs?: number
}

export type BuildBmrclDynamicBlockReturnType = string

/**
 * Builds the dynamic block BMRCL expects buyer apps to append to the provider
 * token.
 */
export function buildBmrclDynamicBlock({
  nowMs = Date.now(),
}: BuildBmrclDynamicBlockParameters = {}): BuildBmrclDynamicBlockReturnType {
  const epochHex = Math.floor(nowMs / 1000).toString(16)
  return `{${epochHex}||0.0|0.0|}`
}

function assertQrToken(token: string): void {
  if (token.trim().length === 0) {
    throw new InvalidMetroQrTokenError({
      reason: 'token is empty',
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
