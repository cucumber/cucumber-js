import { Duration, TimeConversion, Timestamp } from '@cucumber/messages'
import methods from '../time'

/**
 * A utility for timing test run operations and returning duration and
 * timestamp objects in messages-compatible formats
 */
export interface IStopwatch {
  start: () => IStopwatch
  stop: () => IStopwatch
  duration: () => Duration
  timestamp: () => Timestamp
}

class StopwatchImpl implements IStopwatch {
  private started: number

  constructor(private base: Duration = { seconds: 0, nanos: 0 }) {}

  start(): IStopwatch {
    this.started = methods.performance.now()
    return this
  }

  stop(): IStopwatch {
    this.base = this.duration()
    this.started = undefined
    return this
  }

  duration(): Duration {
    if (typeof this.started !== 'number') {
      return this.base
    }
    return TimeConversion.addDurations(
      this.base,
      TimeConversion.millisecondsToDuration(
        methods.performance.now() - this.started
      )
    )
  }

  timestamp(): Timestamp {
    return TimeConversion.millisecondsSinceEpochToTimestamp(methods.Date.now())
  }
}

export const create = (base?: Duration): IStopwatch => new StopwatchImpl(base)
