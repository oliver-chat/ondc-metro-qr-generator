export {
  InvalidMetroQrTokenError,
  MetroQrError,
  UnsupportedMetroBppError,
} from './errors.js'
export type {
  BuildBmrclMetroQrParameters,
  BuildMetroQrProviderParameters,
  BuildMetroQrProviderReturnType,
  MetroQRApi,
  MetroQRRenderPngParameters,
  MetroQRRenderPngReturnType,
} from './metro-qr.js'

import { createMetroQrApi } from './metro-qr.js'

export {
  type BuildBmrclDynamicBlockParameters,
  type BuildBmrclDynamicBlockReturnType,
  type BuildMetroQrPayloadParameters,
  type BuildMetroQrPayloadReturnType,
  buildBmrclDynamicBlock,
  buildMetroQrPayload,
  type MetroQrBytePayload,
  type MetroQrPayload,
  type MetroQrTextPayload,
  type QrErrorCorrectionLevel,
} from './payload.js'
export * from './policies.js'
export {
  renderMetroQrPayloadPng,
  renderMetroQrPng,
} from './render.browser.js'
export type {
  RenderMetroQrPayloadPngParameters,
  RenderMetroQrPayloadPngReturnType,
  RenderMetroQrPngParameters,
  RenderMetroQrPngReturnType,
  RenderQrOptions,
} from './render.js'

import { renderMetroQrPayloadPng } from './render.browser.js'

/** High-level provider-specific QR payload and PNG API. */
export const MetroQR = createMetroQrApi({ renderMetroQrPayloadPng })
