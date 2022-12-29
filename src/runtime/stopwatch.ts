import * as messages from '@cucumber/messages'
import { TimeConversion } from '@cucumber/messages'
import methods from '../time'

export interface IStopwatch {
  start: () => IStopwatch
  stop: () => IStopwatch
  duration: () => messages.Duration
  timestamp: () => messages.Timestamp
}

export class RealStopwatch implements IStopwatch {
  private started: number

  constructor(
    private base: messages.Duration = {
      seconds: 0,
      nanos: 0,
    }
  ) {}

  start(): IStopwatch {
    this.started = methods.performance.now()
    return this
  }

  stop(): IStopwatch {
    this.base = this.duration()
    this.started = undefined
    return this
  }

  duration(): messages.Duration {
    if (!this.started) {
      return this.base
    }
    return TimeConversion.addDurations(
      this.base,
      TimeConversion.millisecondsToDuration(
        methods.performance.now() - this.started
      )
    )
  }

  timestamp(): messages.Timestamp {
    return messages.TimeConversion.millisecondsSinceEpochToTimestamp(
      methods.Date.now()
    )
  }
}

export class PredictableStopwatch implements IStopwatch {
  private count = 0

  constructor(
    private base: messages.Duration = {
      seconds: 0,
      nanos: 0,
    }
  ) {}

  start(): IStopwatch {
    return this
  }

  stop(): IStopwatch {
    return this
  }

  duration(): messages.Duration {
    return TimeConversion.addDurations(
      this.base,
      TimeConversion.millisecondsToDuration(this.count)
    )
  }

  timestamp(): messages.Timestamp {
    const fakeTimestamp = this.duration()
    this.count++
    return fakeTimestamp
  }
}
