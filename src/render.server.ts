import type { QRCodeToBufferOptions } from 'qrcode'
import * as QRCode from 'qrcode/lib/server'
import { createMetroQrPngRenderer } from './render.js'

const renderer = createMetroQrPngRenderer(
  async ({ errorCorrectionLevel, input, margin, width }) => {
    const options: QRCodeToBufferOptions = {
      errorCorrectionLevel,
      margin,
      type: 'png',
      width,
    }
    const png = await QRCode.toBuffer(input, options)
    return new Uint8Array(png)
  },
)

/** Renders a pre-built ONDC metro QR payload into PNG bytes. */
export const renderMetroQrPayloadPng = renderer.renderMetroQrPayloadPng

/** Builds and renders an ONDC metro QR payload into PNG bytes. */
export const renderMetroQrPng = renderer.renderMetroQrPng
