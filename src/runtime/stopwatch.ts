import * as messages from '@cucumber/messages'
import { stopwatch, Stopwatch, duration, Duration } from 'durations'

export interface ITestRunStopwatch {
  from: (duration: Duration) => ITestRunStopwatch
  start: () => ITestRunStopwatch
  stop: () => ITestRunStopwatch
  duration: () => Duration
  timestamp: () => messages.Timestamp
}

export class RealTestRunStopwatch implements ITestRunStopwatch {
  private readonly stopwatch: Stopwatch = stopwatch()
  private base: Duration = null

  from(duration: Duration): ITestRunStopwatch {
    this.base = duration
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

  duration(): Duration {
    const current = this.stopwatch.duration()
    if (this.base !== null) {
      return duration(this.base.nanos() + current.nanos())
    }
    return current
  }

  timestamp(): messages.Timestamp {
    return messages.TimeConversion.millisecondsSinceEpochToTimestamp(Date.now())
  }
}

export class PredictableTestRunStopwatch implements ITestRunStopwatch {
  private count = 0
  private base: Duration = null

  from(duration: Duration): ITestRunStopwatch {
    this.base = duration
    return this
  }

  start(): ITestRunStopwatch {
    return this
  }

  stop(): ITestRunStopwatch {
    return this
  }

  duration(): Duration {
    const current = duration(this.count * 1000000)
    if (this.base !== null) {
      return duration(this.base.nanos() + current.nanos())
    }
    return current
  }

  timestamp(): messages.Timestamp {
    const fakeTimestamp = this.convertToTimestamp(this.duration())
    this.count++
    return fakeTimestamp
  }

  // TODO: Remove. It's impossible to convert timestamps to durations and vice-versa
  private convertToTimestamp(duration: Duration): messages.Timestamp {
    const seconds = Math.floor(duration.seconds())
    const nanos = Math.floor((duration.seconds() - seconds) * 1000000000)
    return {
      seconds,
      nanos,
    }
  }
}
