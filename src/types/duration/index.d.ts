declare module 'duration' {
  export default class Duration {
    constructor(start: Date, end: Date)
    get years(): number
    get months(): number
    get days(): number
    get hours(): number
    get minutes(): number
    get seconds(): number
    get milliseconds(): number
    get month(): number
    get day(): number
    get hour(): number
    get minute(): number
    get second(): number
    get millisecond(): number
    toString(format: string): string
  }
}
