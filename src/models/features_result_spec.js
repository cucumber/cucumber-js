import FeaturesResult from "./features_result";
import Status from "../status";

describe("FeaturesResult", function() {
  describe("strict", function() {
    beforeEach(function() {
      this.featuresResult = new FeaturesResult(true);
    });

    it("is successful by default", function() {
      expect(this.featuresResult.success).to.eql(true);
    });

    describe("after a passed scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.PASSED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is successful", function() {
        expect(this.featuresResult.success).to.eql(true);
      });
    });

    describe("after a failed scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.FAILED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });

    describe("after an ambiguous scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.AMBIGUOUS };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });

    describe("after a pending scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.PENDING };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });

    describe("after an undefined scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.UNDEFINED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });
  });

  describe("not strict", function() {
    beforeEach(function() {
      this.featuresResult = new FeaturesResult(false);
    });

    it("is successful by default", function() {
      expect(this.featuresResult.success).to.eql(true);
    });

    describe("after a passing scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.PASSED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is successful", function() {
        expect(this.featuresResult.success).to.eql(true);
      });
    });

    describe("after a failing scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.FAILED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });

    describe("after an ambiguous scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.AMBIGUOUS };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is not successful", function() {
        expect(this.featuresResult.success).to.eql(false);
      });
    });

    describe("after a pending scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.PENDING };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is successful", function() {
        expect(this.featuresResult.success).to.eql(true);
      });
    });

    describe("after an undefined scenario", function() {
      beforeEach(function() {
        const scenarioResult = { status: Status.UNDEFINED };
        this.featuresResult.witnessScenarioResult(scenarioResult);
      });

      it("is successful", function() {
        expect(this.featuresResult.success).to.eql(true);
      });
    });
  });
});
