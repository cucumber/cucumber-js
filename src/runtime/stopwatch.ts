import * as messages from '@cucumber/messages'
import { stopwatch, Stopwatch, duration, Duration, seconds } from 'durations'
import methods from '../time'

export interface ITestRunStopwatch {
  start: () => ITestRunStopwatch
  stop: () => ITestRunStopwatch
  duration: () => messages.Duration
  timestamp: () => messages.Timestamp
}

export class RealTestRunStopwatch implements ITestRunStopwatch {
  private readonly stopwatch: Stopwatch = stopwatch()

  constructor(private base: messages.Duration = null) {}

  start(): ITestRunStopwatch {
    this.stopwatch.start()
    return this
  }

  stop(): ITestRunStopwatch {
    this.stopwatch.stop()
    return this
  }

  duration(): messages.Duration {
    let current = this.stopwatch.duration()
    if (this.base !== null) {
      current = duration(
        convertFromMessages(this.base).nanos() + current.nanos()
      )
    }
    return convertToMessages(current)
  }

  timestamp(): messages.Timestamp {
    return messages.TimeConversion.millisecondsSinceEpochToTimestamp(
      methods.Date.now()
    )
  }
}

export class PredictableTestRunStopwatch implements ITestRunStopwatch {
  private count = 0

  constructor(private base: messages.Duration = null) {}

  start(): ITestRunStopwatch {
    return this
  }

  stop(): ITestRunStopwatch {
    return this
  }

  duration(): messages.Duration {
    let current = duration(this.count * 1000000)
    if (this.base !== null) {
      current = duration(
        convertFromMessages(this.base).nanos() + current.nanos()
      )
    }
    return convertToMessages(current)
  }

  timestamp(): messages.Timestamp {
    const fakeTimestamp = this.duration()
    this.count++
    return fakeTimestamp
  }
}

function convertToMessages(value: Duration): messages.Duration {
  const seconds = Math.floor(value.seconds())
  const nanos = Math.floor((value.seconds() - seconds) * 1000000000)
  return {
    seconds,
    nanos,
  }
}

function convertFromMessages(value: messages.Duration): Duration {
  return duration(seconds(value.seconds).nanos() + value.nanos)
}
