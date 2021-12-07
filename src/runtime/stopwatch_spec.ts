import { TimeConversion } from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import { RealTestRunStopwatch } from './stopwatch'

describe('stopwatch', () => {
  it('returns a timestamp close to now', () => {
    expect(
      TimeConversion.timestampToMillisecondsSinceEpoch(
        new RealTestRunStopwatch().timestamp()
      )
    ).to.be.closeTo(Date.now(), 100)
  })
})
