import { promisify } from "bluebird";
import fs from "mz/fs";
import { getFeatures } from "./helpers";
import tmp from "tmp";

describe("helpers", function() {
  describe("getFeatures", function() {
    beforeEach(async function() {
      this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true });
    });

    describe("empty feature", function() {
      beforeEach(async function() {
        const tmpFile = await promisify(tmp.file)();
        await fs.writeFile(tmpFile, "");
        this.result = await getFeatures({
          featurePaths: [tmpFile],
          scenarioFilter: createMock({ matches: true })
        });
      });

      it("returns an empty array", function() {
        expect(this.result).to.have.lengthOf(0);
      });
    });

    describe("feature without matching scenarios", function() {
      beforeEach(async function() {
        const tmpFile = await promisify(tmp.file)();
        await fs.writeFile(tmpFile, "Feature: a\nScenario: b\nGiven a step");
        this.result = await getFeatures({
          featurePaths: [tmpFile],
          scenarioFilter: createMock({ matches: false })
        });
      });

      it("returns an empty array", function() {
        expect(this.result).to.have.lengthOf(0);
      });
    });

    describe("feature with matching scenarios", function() {
      beforeEach(async function() {
        const tmpFile = await promisify(tmp.file)();
        await fs.writeFile(tmpFile, "Feature: a\nScenario: b\nGiven a step");
        this.result = await getFeatures({
          featurePaths: [tmpFile],
          scenarioFilter: createMock({ matches: true })
        });
      });

      it("returns the feature", function() {
        expect(this.result).to.have.lengthOf(1);
      });
    });
  });
});
