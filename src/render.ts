import type { QRCodeSegment, QRCodeToBufferOptions } from 'qrcode'
import * as QRCode from 'qrcode'
import {
  type BuildMetroQrPayloadParameters,
  buildMetroQrPayload,
  type MetroQrPayload,
  type QrErrorCorrectionLevel,
} from './payload.js'

export interface RenderMetroQrPngParameters
  extends BuildMetroQrPayloadParameters {
  readonly errorCorrectionLevel?: QrErrorCorrectionLevel
  readonly margin?: number
  readonly width?: number
}

export interface RenderMetroQrPngReturnType {
  readonly payload: MetroQrPayload
  readonly png: Uint8Array
}

/**
 * Renders an ONDC metro QR payload into PNG bytes.
 *
 * @example
 * import { renderMetroQrPng } from 'ondc-metro-qr-generator'
 *
 * const { png } = await renderMetroQrPng({
 *   authorization: { type: 'QR', token: 'synthetic-provider-token' },
 *   bppId: 'ondc-prod-dmrc.sequelstring.com/seller/dmrc',
 * })
 */
export async function renderMetroQrPng({
  errorCorrectionLevel = 'M',
  margin = 1,
  width = 512,
  ...payloadParameters
}: RenderMetroQrPngParameters): Promise<RenderMetroQrPngReturnType> {
  const payload = buildMetroQrPayload(payloadParameters)
  const options: QRCodeToBufferOptions = {
    errorCorrectionLevel,
    margin,
    type: 'png',
    width,
  }
  const png = await QRCode.toBuffer(qrCodeInputFromPayload(payload), options)
  return {
    payload,
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
