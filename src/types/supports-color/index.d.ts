declare module 'supports-color' {
  import { Writable } from 'stream'

  export interface Options {
    readonly sniffFlags?: boolean
  }

  export type ColorSupportLevel = 0 | 1 | 2 | 3

  export interface ColorSupport {
    level: ColorSupportLevel
    hasBasic: boolean
    has256: boolean
    has16m: boolean
  }

  export type ColorInfo = ColorSupport | false

  export function supportsColor(stream: Writable, options?: Options): ColorInfo
}
