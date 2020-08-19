import { describe, it } from 'mocha'
import { RealTestRunStopwatch } from './stopwatch'
import { duration } from 'durations'
import { expect } from 'chai'

describe('stopwatch', () => {
  it('returns a messages timestamp with seconds and nanos', () => {
    expect(
      new RealTestRunStopwatch().from(duration(1234567895)).timestamp()
    ).to.deep.eq({
      seconds: 1,
      nanos: 234567895,
    })
  })

  it('returns a messages timestamp with nanos', () => {
    expect(
      new RealTestRunStopwatch().from(duration(123456)).timestamp()
    ).to.deep.eq({
      seconds: 0,
      nanos: 123456,
    })
  })
})
