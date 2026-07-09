import { TimeConversion } from '@cucumber/messages'
import FakeTimers, { type InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'chai'
import { afterEach, beforeEach, describe, it } from 'mocha'
import timeMethods from '../time'
import { create, timestamp } from './stopwatch'

describe('stopwatch', () => {
  describe('duration', () => {
    let clock: InstalledClock

    beforeEach(() => {
      clock = FakeTimers.withGlobal(timeMethods).install()
    })

    afterEach(() => {
      clock.uninstall()
    })

    it('returns a duration between the start and stop', () => {
      const stopwatch = create()
      stopwatch.start()
      clock.tick(1200)
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(1200)
    })

    it('accounts for an initial duration', () => {
      const stopwatch = create(TimeConversion.millisecondsToDuration(300))
      stopwatch.start()
      clock.tick(200)
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(500)
    })

    it('returns accurate durations ad-hoc if not stopped', () => {
      const stopwatch = create()
      stopwatch.start()
      clock.tick(200)
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(200)
      clock.tick(200)
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(400)
    })

    it('returns 0 duration if never started', () => {
      const stopwatch = create()
      clock.tick(200)
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(0)
    })
  })

  it('returns a timestamp close to now', () => {
    expect(TimeConversion.timestampToMillisecondsSinceEpoch(timestamp())).to.be.closeTo(
      Date.now(),
      100
    )
  })
})
