import { describe, it } from "mocha";
import { RealStopwatch } from "./stopwatch";
import { expect } from "chai";
import { TimeConversion } from "@cucumber/messages";

describe("stopwatch", () => {
  it("returns a duration between the start and stop", async () => {
    const stopwatch = new RealStopwatch();
    stopwatch.start();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    stopwatch.stop();
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(1200, 50);
  });

  it("accounts for an initial duration", async () => {
    const stopwatch = new RealStopwatch(
      TimeConversion.millisecondsToDuration(300)
    );
    stopwatch.start();
    await new Promise((resolve) => setTimeout(resolve, 200));
    stopwatch.stop();
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(500, 50);
  });

  it("returns accurate durations ad-hoc if not stopped", async () => {
    const stopwatch = new RealStopwatch();
    stopwatch.start();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(200, 50);
    await new Promise((resolve) => setTimeout(resolve, 200));
    stopwatch.stop();
    expect(
      TimeConversion.durationToMilliseconds(stopwatch.duration())
    ).to.be.closeTo(400, 50);
  });

  it("returns 0 duration if never started", async () => {
    const stopwatch = new RealStopwatch();
    await new Promise((resolve) => setTimeout(resolve, 200));
    stopwatch.stop();
    expect(TimeConversion.durationToMilliseconds(stopwatch.duration())).to.eq(
      0
    );
  });

  it("returns a timestamp close to now", () => {
    expect(
      TimeConversion.timestampToMillisecondsSinceEpoch(
        new RealStopwatch().timestamp()
      )
    ).to.be.closeTo(Date.now(), 100);
  });
});
