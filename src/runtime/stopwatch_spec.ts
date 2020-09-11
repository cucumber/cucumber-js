import { describe, it } from 'mocha'
import { RealTestRunStopwatch } from './stopwatch'
import { expect } from 'chai'
import { TimeConversion } from '@cucumber/messages'

describe('stopwatch', () => {
  it('returns a timestamp close to now', () => {
    expect(
      TimeConversion.timestampToMillisecondsSinceEpoch(
        new RealTestRunStopwatch().timestamp()
      )
    ).to.be.closeTo(Date.now(), 100)
  })
})
