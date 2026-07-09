export interface MetroQrErrorParameters {
  readonly message: string
}

export class MetroQrError extends Error {
  constructor({ message }: MetroQrErrorParameters) {
    super(message)
    this.name = 'MetroQrError'
  }
}

export interface UnsupportedMetroBppErrorParameters {
  readonly bppId: string | null | undefined
}

export class UnsupportedMetroBppError extends MetroQrError {
  readonly bppId: string | null | undefined

  constructor({ bppId }: UnsupportedMetroBppErrorParameters) {
    super({
      message: `Unsupported ONDC metro BPP id: ${bppId ?? '<missing>'}`,
    })
    this.name = 'UnsupportedMetroBppError'
    this.bppId = bppId
  }
}

export interface InvalidMetroQrTokenErrorParameters {
  readonly reason: string
}

export class InvalidMetroQrTokenError extends MetroQrError {
  readonly reason: string

  constructor({ reason }: InvalidMetroQrTokenErrorParameters) {
    super({ message: `Invalid ONDC metro QR token: ${reason}` })
    this.name = 'InvalidMetroQrTokenError'
    this.reason = reason
  }
}
