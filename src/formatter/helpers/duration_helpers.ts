import { Duration } from '@cucumber/messages'

const NANOS_IN_SECOND = 1_000_000_000

export function durationToNanoseconds(duration: Duration): number {
  return Math.floor(duration.seconds * NANOS_IN_SECOND + duration.nanos)
}
