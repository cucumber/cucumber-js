import { describe, it } from "mocha";
import { RealTestRunStopwatch } from "./stopwatch";
import { expect } from "chai";
import { TimeConversion } from "@cucumber/messages";
import { millis } from "durations";

describe('stopwatch', () => {
  describe("RealTestRunStopwatch", () => {
    it("returns a duration between the start and stop",async () => {
      const stopwatch = new RealTestRunStopwatch()
      stopwatch.start()
      await new Promise(resolve => setTimeout(resolve, 1200))
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds({
        seconds: stopwatch.duration().seconds(),
        nanos: 0
      })).to.be.closeTo(1200, 50)
    });

    it("accounts for an initial duration",async () => {
      const stopwatch = new RealTestRunStopwatch().from(millis(300))
      stopwatch.start()
      await new Promise(resolve => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds({
        seconds: stopwatch.duration().seconds(),
        nanos: 0
      })).to.be.closeTo(500, 50)
    });

    it("returns accurate durations ad-hoc if not stopped", async () => {
      const stopwatch = new RealTestRunStopwatch()
      stopwatch.start()
      await new Promise(resolve => setTimeout(resolve, 200))
      expect(TimeConversion.durationToMilliseconds({
        seconds: stopwatch.duration().seconds(),
        nanos: 0
      })).to.be.closeTo(200, 50)
      await new Promise(resolve => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds({
        seconds: stopwatch.duration().seconds(),
        nanos: 0
      })).to.be.closeTo(400, 50)
    });

    it("returns 0 duration if never started",async () => {
      const stopwatch = new RealTestRunStopwatch()
      await new Promise(resolve => setTimeout(resolve, 200))
      stopwatch.stop()
      expect(TimeConversion.durationToMilliseconds({
        seconds: stopwatch.duration().seconds(),
        nanos: 0
      })).to.eq(0)
    });

    it('returns a timestamp close to now', () => {
      expect(
        TimeConversion.timestampToMillisecondsSinceEpoch(
          new RealTestRunStopwatch().timestamp()
        )
      ).to.be.closeTo(Date.now(), 100)
    })
  });

})
