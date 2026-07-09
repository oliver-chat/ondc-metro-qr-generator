import {
  type BuildMetroQrPayloadReturnType,
  buildMetroQrPayload,
} from './payload.js'
import { BppID } from './policies.js'
import {
  type RenderMetroQrPayloadPngReturnType,
  type RenderQrOptions,
  renderMetroQrPayloadPng,
} from './render.js'

export interface BuildMetroQrProviderParameters {
  readonly token: string
}

export interface BuildBmrclMetroQrParameters
  extends BuildMetroQrProviderParameters {
  readonly nowMs?: number
}

export type BuildMetroQrProviderReturnType = BuildMetroQrPayloadReturnType

export interface MetroQRRenderPngParameters {
  readonly payload: BuildMetroQrProviderReturnType
  readonly qrOptions?: RenderQrOptions
}

export type MetroQRRenderPngReturnType =
  Promise<RenderMetroQrPayloadPngReturnType>

export interface MetroQRApi {
  readonly bmrcl: (
    parameters: BuildBmrclMetroQrParameters,
  ) => BuildMetroQrProviderReturnType
  readonly dmrc: (
    parameters: BuildMetroQrProviderParameters,
  ) => BuildMetroQrProviderReturnType
  readonly mmmocl: (
    parameters: BuildMetroQrProviderParameters,
  ) => BuildMetroQrProviderReturnType
  readonly mmopl: (
    parameters: BuildMetroQrProviderParameters,
  ) => BuildMetroQrProviderReturnType
  readonly mmrcl: (
    parameters: BuildMetroQrProviderParameters,
  ) => BuildMetroQrProviderReturnType
  readonly renderPng: (
    parameters: MetroQRRenderPngParameters,
  ) => MetroQRRenderPngReturnType
}

/**
 * High-level provider-specific QR payload builder.
 *
 * @example
 * import { MetroQR } from 'ondc-metro-qr-generator'
 *
 * const payload = MetroQR.bmrcl({
 *   token: 'synthetic-provider-token',
 * })
 * const { png } = await MetroQR.renderPng({
 *   payload,
 *   qrOptions: { width: 512 },
 * })
 */
export const MetroQR = {
  bmrcl(parameters) {
    return buildMetroQrPayload({
      ...parameters,
      bppId: BppID.BMRCL,
    })
  },
  dmrc(parameters) {
    return buildMetroQrPayload({
      ...parameters,
      bppId: BppID.DMRC,
    })
  },
  mmmocl(parameters) {
    return buildMetroQrPayload({
      ...parameters,
      bppId: BppID.MMMOCL,
    })
  },
  mmopl(parameters) {
    return buildMetroQrPayload({
      ...parameters,
      bppId: BppID.MMOPL,
    })
  },
  mmrcl(parameters) {
    return buildMetroQrPayload({
      ...parameters,
      bppId: BppID.MMRCL,
    })
  },
  renderPng({ payload, qrOptions }) {
    return renderMetroQrPayloadPng({
      payload,
      ...(qrOptions ?? {}),
    })
  },
} satisfies MetroQRApi
