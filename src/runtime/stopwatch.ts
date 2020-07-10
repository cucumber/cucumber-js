import { messages } from '@cucumber/messages'
import { stopwatch, Stopwatch, duration, Duration } from 'durations'

export interface ITestRunStopwatch {
  from: (duration: Duration) => ITestRunStopwatch
  start: () => ITestRunStopwatch
  stop: () => ITestRunStopwatch
  duration: () => Duration
  timestamp: () => messages.ITimestamp
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

  timestamp(): messages.ITimestamp {
    const current = this.duration()
    return {
      nanos: current.nanos(),
      seconds: current.seconds(),
    }
  }
}

export class PredictableTestRunStopwatch implements ITestRunStopwatch {
  private readonly count = 0
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
    const current = duration(this.count + 1000000)
    if (this.base !== null) {
      return duration(this.base.nanos() + current.nanos())
    }
    return current
  }

  timestamp(): messages.ITimestamp {
    const current = this.duration()
    return {
      nanos: current.nanos(),
      seconds: current.seconds(),
    }
  }
}
