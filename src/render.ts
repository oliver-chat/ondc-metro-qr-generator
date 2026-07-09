import type { QRCodeSegment, QRCodeToBufferOptions } from 'qrcode'
import * as QRCode from 'qrcode'
import {
  type BuildMetroQrPayloadParameters,
  buildMetroQrPayload,
  type MetroQrPayload,
  type QrErrorCorrectionLevel,
} from './payload.js'

export interface RenderMetroQrPngParameters
  extends BuildMetroQrPayloadParameters,
    RenderQrOptions {}

export interface RenderQrOptions {
  readonly errorCorrectionLevel?: QrErrorCorrectionLevel
  readonly margin?: number
  readonly width?: number
}

export interface RenderMetroQrPngReturnType {
  readonly payload: MetroQrPayload
  readonly png: Uint8Array
}

export interface RenderMetroQrPayloadPngParameters extends RenderQrOptions {
  readonly payload: MetroQrPayload
}

export interface RenderMetroQrPayloadPngReturnType {
  readonly png: Uint8Array
}

/**
 * Renders an ONDC metro QR payload into PNG bytes.
 *
 * @example
 * import { BppID, renderMetroQrPng } from 'ondc-metro-qr-generator'
 *
 * const { png } = await renderMetroQrPng({
 *   bppId: BppID.DMRC,
 *   token: 'qr-token',
 * })
 */
export async function renderMetroQrPng({
  errorCorrectionLevel = 'M',
  margin = 1,
  width = 512,
  ...payloadParameters
}: RenderMetroQrPngParameters): Promise<RenderMetroQrPngReturnType> {
  const payload = buildMetroQrPayload(payloadParameters)
  const { png } = await renderMetroQrPayloadPng({
    errorCorrectionLevel,
    margin,
    payload,
    width,
  })
  return {
    payload,
    png,
  }
}

/**
 * Renders a pre-built ONDC metro QR payload into PNG bytes.
 *
 * @example
 * import { BppID, buildMetroQrPayload, renderMetroQrPayloadPng } from 'ondc-metro-qr-generator'
 *
 * const payload = buildMetroQrPayload({
 *   bppId: BppID.DMRC,
 *   token: 'qr-token',
 * })
 * const { png } = await renderMetroQrPayloadPng({ payload })
 */
export async function renderMetroQrPayloadPng({
  errorCorrectionLevel = 'M',
  margin = 1,
  payload,
  width = 512,
}: RenderMetroQrPayloadPngParameters): Promise<RenderMetroQrPayloadPngReturnType> {
  const options: QRCodeToBufferOptions = {
    errorCorrectionLevel,
    margin,
    type: 'png',
    width,
  }
  const png = await QRCode.toBuffer(qrCodeInputFromPayload(payload), options)
  return {
    png: new Uint8Array(png),
  }
}

function qrCodeInputFromPayload(
  payload: MetroQrPayload,
): string | QRCodeSegment[] {
  if (payload.kind === 'bytes') {
    return [{ data: payload.bytes, mode: 'byte' }]
  }
  return payload.text
}
