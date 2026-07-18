declare module 'assertion-error-formatter' {
  type ColorFn = (value: string) => string

  export interface FormatOptions {
    colorFns?: {
      diffAdded?: ColorFn
      diffRemoved?: ColorFn
      errorMessage?: ColorFn
      errorStack?: ColorFn
    }
    inlineDiff?: boolean
  }

  export function format(error: Error, options?: FormatOptions): string
}
