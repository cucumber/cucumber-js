import { describe, it } from 'mocha'
import { expect } from 'chai'
import { TimeConversion } from '@cucumber/messages'
import { create } from './stopwatch'

describe('stopwatch', () => {
  it('returns a duration between the start and stop', async () => {
    const stopwatch = create()
    stopwatch.start()
    await new Promise((resolve) => setTimeout(resolve, 1200))
    stopwatch.stop()
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(1200, 50)
  })

  it('accounts for an initial duration', async () => {
    const stopwatch = create(TimeConversion.millisecondsToDuration(300))
    stopwatch.start()
    await new Promise((resolve) => setTimeout(resolve, 200))
    stopwatch.stop()
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(500, 50)
  })

  it('returns accurate durations ad-hoc if not stopped', async () => {
    const stopwatch = create()
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
    const stopwatch = create()
    await new Promise((resolve) => setTimeout(resolve, 200))
    stopwatch.stop()
    expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(0)
  })

  it('returns a timestamp close to now', () => {
    expect(
      TimeConversion.timestampToMillisecondsSinceEpoch(create().timestamp())
    ).to.be.closeTo(Date.now(), 100)
  })
})
