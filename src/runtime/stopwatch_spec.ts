import { describe, it } from 'mocha'
import { PredictableTestRunStopwatch, RealTestRunStopwatch } from './stopwatch'
import { expect } from 'chai'
import { TimeConversion } from '@cucumber/messages'

describe('stopwatch', () => {
  describe('RealTestRunStopwatch', () => {
    it('returns a duration between the start and stop', async () => {
      const stopwatch = new RealTestRunStopwatch()
      stopwatch.start()
      await new Promise((resolve) => setTimeout(resolve, 1200))
      stopwatch.stop()
      expect(
        TimeConversion.durationToMilliseconds(stopwatch.duration())
      ).to.be.closeTo(1200, 50)
    })

    it('accounts for an initial duration', async () => {
      const stopwatch = new RealTestRunStopwatch().from(
        TimeConversion.millisecondsToDuration(300)
      )
      stopwatch.start()
      await new Promise((resolve) => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(
        TimeConversion.durationToMilliseconds(stopwatch.duration())
      ).to.be.closeTo(500, 50)
    })

    it('returns accurate durations ad-hoc if not stopped', async () => {
      const stopwatch = new RealTestRunStopwatch()
      stopwatch.start()
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(
        TimeConversion.durationToMilliseconds(stopwatch.duration())
      ).to.be.closeTo(200, 50)
      await new Promise((resolve) => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(
        TimeConversion.durationToMilliseconds(stopwatch.duration())
      ).to.be.closeTo(400, 50)
    })

    it('returns 0 duration if never started', async () => {
      const stopwatch = new RealTestRunStopwatch()
      await new Promise((resolve) => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(
        0
      )
    })

    it('returns a timestamp close to now', () => {
      expect(
        TimeConversion.timestampToMillisecondsSinceEpoch(
          new RealTestRunStopwatch().timestamp()
        )
      ).to.be.closeTo(Date.now(), 100)
    })
  })

  describe('PredictableTestRunStopwatch', () => {
    it('increments 1000000 nanos every time a timestamp is requested', () => {
      const stopwatch = new PredictableTestRunStopwatch()
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 0,
        nanos: 0,
      })
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 0,
        nanos: 1000000,
      })
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 0,
        nanos: 2000000,
      })
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 0,
        nanos: 3000000,
      })
    })

    it('supports an initial duration', () => {
      const stopwatch = new PredictableTestRunStopwatch().from({
        seconds: 1,
        nanos: 200000000,
      })
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 1,
        nanos: 199999999,
      })
      expect(stopwatch.timestamp()).to.deep.eq({
        seconds: 1,
        nanos: 201000000,
      })
    })
  })
})
