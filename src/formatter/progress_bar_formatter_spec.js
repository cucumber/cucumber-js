import getColorFns from "./get_color_fns";
import Hook from "../models/hook";
import ProgressBarFormatter from "./progress_bar_formatter";
import Status from "../status";
import Step from "../models/step";

describe("ProgressBarFormatter", function() {
  beforeEach(function() {
    this.output = "";
    const logFn = data => {
      this.output += data;
    };
    const colorFns = getColorFns(false);
    this.progressBarFormatter = new ProgressBarFormatter({
      colorFns,
      cwd: "path/to/project",
      log: logFn,
      snippetBuilder: createMock({ build: "snippet" }),
      stream: {}
    });
  });

  describe("before features", function() {
    beforeEach(function() {
      const features = [
        { scenarios: [{ steps: [1, 2, 3] }] },
        { scenarios: [{ steps: [4, 5] }] }
      ];
      this.progressBarFormatter.handleBeforeFeatures(features);
    });

    it("initializes a progress bar with the total number of steps", function() {
      expect(this.progressBarFormatter.progressBar.total).to.eql(5);
    });
  });

  describe("step result", function() {
    beforeEach(function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub()
      };
    });

    describe("step is a hook", function() {
      beforeEach(function() {
        this.stepResult = {
          status: null,
          step: Object.create(Hook.prototype)
        };
      });

      describe("failed", function() {
        beforeEach(function() {
          this.stepResult.status = Status.FAILED;
          this.stepResult.failureException = new Error("error message");
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("does not increase the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
            .called;
        });

        it("prints the error", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });

      describe("passed", function() {
        beforeEach(function() {
          this.stepResult.status = Status.PASSED;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("does not increase the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
            .called;
        });

        it("does not print anything", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).not.to.have
            .been.called;
        });
      });

      describe("pending", function() {
        beforeEach(function() {
          this.stepResult.status = Status.PENDING;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("does not increase the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
            .called;
        });

        it("prints the warning", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });

      describe("skipped", function() {
        beforeEach(function() {
          this.stepResult.status = Status.SKIPPED;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("does not increase the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
            .called;
        });

        it("does not print anything", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).not.to.have
            .been.called;
        });
      });
    });

    describe("step is a normal step", function() {
      beforeEach(function() {
        this.stepResult = createMock({
          status: null,
          step: Object.create(Step.prototype)
        });
      });

      describe("ambiguous", function() {
        beforeEach(function() {
          this.stepResult.status = Status.AMBIGUOUS;
          this.stepResult.ambiguousStepDefinitions = [
            { line: 1, pattern: /a/, uri: "path/to/project/file1" },
            { line: 1, pattern: /b/, uri: "path/to/project/file2" }
          ];
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("prints the error", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });

      describe("failed", function() {
        beforeEach(function() {
          this.stepResult.status = Status.FAILED;
          this.stepResult.failureException = new Error("error message");
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("prints the error", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });

      describe("passed", function() {
        beforeEach(function() {
          this.stepResult.status = Status.PASSED;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("does not print anything", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).not.to.have
            .been.called;
        });
      });

      describe("pending", function() {
        beforeEach(function() {
          this.stepResult.status = Status.PENDING;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("prints the warning", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });

      describe("skipped", function() {
        beforeEach(function() {
          this.stepResult.status = Status.SKIPPED;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("does not print anything", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).not.to.have
            .been.called;
        });
      });

      describe("undefined", function() {
        beforeEach(function() {
          this.stepResult.status = Status.UNDEFINED;
          this.progressBarFormatter.handleStepResult(this.stepResult);
        });

        it("increases the progress bar percentage", function() {
          expect(this.progressBarFormatter.progressBar.tick).to.have.been
            .calledOnce;
        });

        it("prints the warning", function() {
          expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
            .calledOnce;
        });
      });
    });
  });

  describe("after features", function() {
    beforeEach(function() {
      const featuresResult = {
        duration: 0,
        scenarioResults: [],
        stepResults: []
      };
      this.progressBarFormatter.handleFeaturesResult(featuresResult);
    });

    it("outputs step totals, scenario totals, and duration", function() {
      expect(this.output).to.contain(
        "0 scenarios\n" + "0 steps\n" + "0m00.000s\n"
      );
    });
  });
});
