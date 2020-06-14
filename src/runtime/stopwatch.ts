import { messages } from '@cucumber/messages'
import { stopwatch, Stopwatch, duration } from 'durations'

export interface ITestRunStopwatch {
  start(): ITestRunStopwatch
  stop(): ITestRunStopwatch
  timestamp(): messages.ITimestamp
}

export class RealTestRunStopwatch implements ITestRunStopwatch {
  private readonly stopwatch: Stopwatch = stopwatch()

  start(): ITestRunStopwatch {
    this.stopwatch.start()
    return this
  }

  stop(): ITestRunStopwatch {
    this.stopwatch.stop()
    return this
  }

  timestamp(): messages.ITimestamp {
    const duration = this.stopwatch.duration()
    return {
      nanos: duration.nanos(),
      seconds: duration.seconds(),
    }
  }
}

export class PredictableTestRunStopwatch implements ITestRunStopwatch {
  private count = 0

  start(): ITestRunStopwatch {
    return this
  }

  stop(): ITestRunStopwatch {
    return this
  }

  timestamp(): messages.ITimestamp {
    this.count++
    const nanos = this.count * 1000000
    return {
      nanos,
      seconds: duration(nanos).seconds(),
    }
  }
}
