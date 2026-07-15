import type { QRCodeToDataURLOptions } from 'qrcode'
import * as QRCode from 'qrcode/lib/browser'
import { createMetroQrPngRenderer } from './render.js'

const renderer = createMetroQrPngRenderer(
  async ({ errorCorrectionLevel, input, margin, width }) => {
    const options: QRCodeToDataURLOptions = {
      errorCorrectionLevel,
      margin,
      type: 'image/png',
      width,
    }
    const dataUrl = await QRCode.toDataURL(input, options)
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  },
)

/** Renders a pre-built ONDC metro QR payload into PNG bytes. */
export const renderMetroQrPayloadPng = renderer.renderMetroQrPayloadPng

/** Builds and renders an ONDC metro QR payload into PNG bytes. */
export const renderMetroQrPng = renderer.renderMetroQrPng
