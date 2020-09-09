import { stopwatch } from 'durations'
import { messages, TimeConversion } from '@cucumber/messages'

export type StartStopwatch = () => StopStopwatch
export type StopStopwatch = () => messages.IDuration
export type Timestamp = () => messages.ITimestamp

const methods: any = {
  clearInterval: clearInterval.bind(global),
  clearTimeout: clearTimeout.bind(global),
  Date,
  setInterval: setInterval.bind(global),
  setTimeout: setTimeout.bind(global),
}

if (typeof setImmediate !== 'undefined') {
  methods.setImmediate = setImmediate.bind(global)
  methods.clearImmediate = clearImmediate.bind(global)
}

export function makeStartHundredMillisStopwatch(): StartStopwatch {
  return () => () => TimeConversion.millisecondsToDuration(100)
}

export function startRealStopwatch(): StopStopwatch {
  const watch = stopwatch()
  watch.start()
  let stopped = false
  return () => {
    if (stopped) throw new Error('Already stopped')
    stopped = true
    watch.stop()
    const d = watch.duration()
    return new messages.Duration({
      seconds: d.seconds(),
      nanos: d.nanos(),
    })
  }
}

export function epochTimestamp(): messages.ITimestamp {
  return TimeConversion.millisecondsSinceEpochToTimestamp(0)
}

export function realTimestamp(): messages.ITimestamp {
  return TimeConversion.millisecondsSinceEpochToTimestamp(Date.now())
}

export default methods
