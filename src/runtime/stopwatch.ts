import * as messages from '@cucumber/messages'
import { stopwatch, Stopwatch, duration, Duration, seconds } from 'durations'
import methods from '../time'

export interface ITestRunStopwatch {
  from: (duration: messages.Duration) => ITestRunStopwatch
  start: () => ITestRunStopwatch
  stop: () => ITestRunStopwatch
  duration: () => messages.Duration
  timestamp: () => messages.Timestamp
}

export class RealTestRunStopwatch implements ITestRunStopwatch {
  private readonly stopwatch: Stopwatch = stopwatch()
  private base: Duration = null

  from(initial: messages.Duration): ITestRunStopwatch {
    this.base = convertFromMessages(initial)
    return this
  }

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
      current = duration(this.base.nanos() + current.nanos())
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
  private base: Duration = null

  from(initial: messages.Duration): ITestRunStopwatch {
    this.base = convertFromMessages(initial)
    return this
  }

  start(): ITestRunStopwatch {
    return this
  }

  stop(): ITestRunStopwatch {
    return this
  }

  duration(): messages.Duration {
    let current = duration(this.count * 1000000)
    if (this.base !== null) {
      current = duration(this.base.nanos() + current.nanos())
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
