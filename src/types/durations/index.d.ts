declare module 'durations' {
  export class Duration {
    nanos(): number
    seconds(): number
  }

  export class Stopwatch {
    start(): Stopwatch
    stop(): Stopwatch
    reset(): Stopwatch
    duration(): Duration
    isRunning(): boolean
  }

  export function duration(nanoseconds: number): Duration

  export function stopwatch(): Stopwatch
}
