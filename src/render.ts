import type { QRCodeSegment } from 'qrcode'
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

export interface MetroQrPngRenderer {
  readonly renderMetroQrPayloadPng: (
    parameters: RenderMetroQrPayloadPngParameters,
  ) => Promise<RenderMetroQrPayloadPngReturnType>
  readonly renderMetroQrPng: (
    parameters: RenderMetroQrPngParameters,
  ) => Promise<RenderMetroQrPngReturnType>
}

export interface EncodeQrPngParameters {
  readonly errorCorrectionLevel: QrErrorCorrectionLevel
  readonly input: string | QRCodeSegment[]
  readonly margin: number
  readonly width: number
}

export type EncodeQrPng = (
  parameters: EncodeQrPngParameters,
) => Promise<Uint8Array>

export function createMetroQrPngRenderer(
  encodeQrPng: EncodeQrPng,
): MetroQrPngRenderer {
  async function renderMetroQrPayloadPng({
    errorCorrectionLevel = 'M',
    margin = 1,
    payload,
    width = 512,
  }: RenderMetroQrPayloadPngParameters): Promise<RenderMetroQrPayloadPngReturnType> {
    return {
      png: await encodeQrPng({
        errorCorrectionLevel,
        input: qrCodeInputFromPayload(payload),
        margin,
        width,
      }),
    }
  }

  async function renderMetroQrPng({
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
    return { payload, png }
  }

  return { renderMetroQrPayloadPng, renderMetroQrPng }
}

function qrCodeInputFromPayload(
  payload: MetroQrPayload,
): string | QRCodeSegment[] {
  if (payload.kind === 'bytes') {
    return [{ data: payload.bytes, mode: 'byte' }]
  }
  return payload.text
}
