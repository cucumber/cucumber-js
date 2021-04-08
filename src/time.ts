import { messages, TimeConversion } from '@cucumber/messages'
import { doesNotHaveValue } from './value_checker'
import Long from 'long'

export const NANOSECONDS_IN_MILLISECOND = 1e6
export const MILLISECONDS_IN_SECOND = 1e3
export const NANOSECONDS_IN_SECOND = 1e9

let previousTimestamp: number

const methods: any = {
  beginTiming() {
    previousTimestamp = getTimestamp()
  },
  clearInterval: clearInterval.bind(global),
  clearTimeout: clearTimeout.bind(global),
  Date,
  endTiming() {
    return getTimestamp() - previousTimestamp
  },
  setInterval: setInterval.bind(global),
  setTimeout: setTimeout.bind(global),
}

if (typeof setImmediate !== 'undefined') {
  methods.setImmediate = setImmediate.bind(global)
  methods.clearImmediate = clearImmediate.bind(global)
}

function getTimestamp(): number {
  return new methods.Date().getTime()
}

function toNumber(x: number | Long): number {
  return typeof x === 'number' ? x : x.toNumber()
}

export function addDurations(
  a: messages.IDuration,
  b: messages.IDuration
): messages.IDuration {
  if (doesNotHaveValue(b)) {
    return a
  }
  let seconds = toNumber(a.seconds) + toNumber(b.seconds)
  let nanos = a.nanos + b.nanos
  if (nanos > NANOSECONDS_IN_SECOND) {
    seconds += 1
    nanos -= NANOSECONDS_IN_SECOND
  }
  return new messages.Duration({ seconds, nanos })
}

// TODO use TimeConversion methods in cucumber-messages
//   dependent on https://github.com/cucumber/cucumber/pull/832
export function millisecondsToDuration(
  milliseconds: number
): messages.IDuration {
  const seconds = Math.floor(milliseconds / MILLISECONDS_IN_SECOND)
  const nanos =
    (milliseconds - seconds * MILLISECONDS_IN_SECOND) *
    NANOSECONDS_IN_MILLISECOND
  return new messages.Duration({ seconds, nanos })
}

export function durationToMilliseconds(duration: messages.IDuration): number {
  const secondMillis = toNumber(duration.seconds) * MILLISECONDS_IN_SECOND
  const nanoMillis = duration.nanos / NANOSECONDS_IN_MILLISECOND
  return secondMillis + nanoMillis
}

export function durationToNanoseconds(duration: messages.IDuration): number {
  return toNumber(duration.seconds) * NANOSECONDS_IN_SECOND + duration.nanos
}

export function durationBetweenTimestamps(
  startedTimestamp: messages.ITimestamp,
  finishedTimestamp: messages.ITimestamp
): messages.IDuration {
  const durationMillis =
    TimeConversion.timestampToMillisecondsSinceEpoch(finishedTimestamp) -
    TimeConversion.timestampToMillisecondsSinceEpoch(startedTimestamp)
  return TimeConversion.millisecondsToDuration(durationMillis)
}

export function getZeroDuration(): messages.IDuration {
  return new messages.Duration({ seconds: 0, nanos: 0 })
}

export default methods
