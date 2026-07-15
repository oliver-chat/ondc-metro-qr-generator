declare module 'qrcode/lib/server' {
  import type { QRCodeSegment, QRCodeToBufferOptions } from 'qrcode'

  export function toBuffer(
    input: string | QRCodeSegment[],
    options: QRCodeToBufferOptions,
  ): Promise<Uint8Array>
}

declare module 'qrcode/lib/browser' {
  import type { QRCodeSegment, QRCodeToDataURLOptions } from 'qrcode'

  export function toDataURL(
    input: string | QRCodeSegment[],
    options: QRCodeToDataURLOptions,
  ): Promise<string>
}
