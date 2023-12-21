declare module 'supports-color' {
  import { Writable } from 'node:stream'

  export interface Options {
    readonly sniffFlags?: boolean
  }

  export type ColorSupportLevel = 0 | 1 | 2 | 3

  export interface ColorSupport {
    level: ColorSupportLevel
  }

  export type ColorInfo = ColorSupport | false

  export function supportsColor(stream: Writable, options?: Options): ColorInfo
}
