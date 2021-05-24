import * as messages from '@cucumber/messages'

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

export function durationBetweenTimestamps(
  startedTimestamp: messages.Timestamp,
  finishedTimestamp: messages.Timestamp
): messages.Duration {
  const durationMillis =
    messages.TimeConversion.timestampToMillisecondsSinceEpoch(
      finishedTimestamp
    ) -
    messages.TimeConversion.timestampToMillisecondsSinceEpoch(startedTimestamp)
  return messages.TimeConversion.millisecondsToDuration(durationMillis)
}

export default methods
