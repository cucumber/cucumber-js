import getColorFns from './get_color_fns'
import Hook from '../models/hook'
import ProgressBarFormatter from './progress_bar_formatter'
import Status from '../status'
import Step from '../models/step'

describe('ProgressBarFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    const colorFns = getColorFns(false)
    this.progressBarFormatter = new ProgressBarFormatter({
      colorFns,
      cwd: 'path/to/project',
      log: logFn,
      snippetBuilder: createMock({ build: 'snippet' }),
      stream: {}
    })
  })

  describe('before features', function() {
    beforeEach(function() {
      const features = [
        { scenarios: [{ steps: [1, 2, 3] }] },
        { scenarios: [{ steps: [4, 5] }] }
      ]
      this.progressBarFormatter.handleBeforeFeatures(features)
    })

    it('initializes a progress bar with the total number of steps', function() {
      expect(this.progressBarFormatter.progressBar.total).to.eql(5)
    })
  })

  describe('step result', function() {
    beforeEach(function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub()
      }
    })

    describe('step is a hook', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleStepResult({
          status: Status.PASSED,
          step: Object.create(Hook.prototype)
        })
      })

      it('does not increase the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
          .called
      })
    })

    describe('step is a normal step', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleStepResult({
          status: Status.PASSED,
          step: Object.create(Step.prototype)
        })
      })

      it('increases the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).to.have.been
          .calledOnce
      })
    })
  })

  describe('scenarioResult', function() {
    beforeEach(function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub()
      }
      this.scenario = {
        line: 1,
        uri: 'path/to/project/a.feature'
      }
      this.step = {
        arguments: []
      }
    })

    describe('ambiguous', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.AMBIGUOUS,
          scenario: this.scenario,
          stepResults: [
            {
              ambiguousStepDefinitions: [
                { line: 1, pattern: /a/, uri: 'path/to/project/file1' },
                { line: 1, pattern: /b/, uri: 'path/to/project/file2' }
              ],
              status: Status.AMBIGUOUS,
              step: this.step
            }
          ]
        })
      })

      it('prints the error', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('failed', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.FAILED,
          scenario: this.scenario,
          stepResults: [
            {
              failureException: new Error('error message'),
              status: Status.FAILED,
              step: this.step,
              stepDefinition: {
                line: 1,
                uri: 'path/to/project/steps.js'
              }
            }
          ]
        })
      })

      it('prints the error', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('passed', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.PASSED,
          scenario: this.scenario,
          stepResults: [
            {
              status: Status.PASSED,
              step: this.step,
              stepDefinition: {
                line: 1,
                uri: 'path/to/project/steps.js'
              }
            }
          ]
        })
      })

      it('does not print anything', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).not.to.have.been
          .called
      })
    })

    describe('pending', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.PENDING,
          scenario: this.scenario,
          stepResults: [
            {
              status: Status.PENDING,
              step: this.step,
              stepDefinition: {
                line: 1,
                uri: 'path/to/project/steps.js'
              }
            }
          ]
        })
      })

      it('prints the warning', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('skipped', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.SKIPPED,
          scenario: this.scenario,
          stepResults: [
            {
              status: Status.SKIPPED,
              step: this.step,
              stepDefinition: {
                line: 1,
                uri: 'path/to/project/steps.js'
              }
            }
          ]
        })
      })

      it('does not print anything', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).not.to.have.been
          .called
      })
    })

    describe('undefined', function() {
      beforeEach(function() {
        this.progressBarFormatter.handleScenarioResult({
          status: Status.UNDEFINED,
          scenario: this.scenario,
          stepResults: [
            {
              status: Status.UNDEFINED,
              step: this.step
            }
          ]
        })
      })

      it('prints the warning', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })
  })

  describe('after features', function() {
    beforeEach(function() {
      const featuresResult = {
        duration: 0,
        scenarioResults: [],
        stepResults: []
      }
      this.progressBarFormatter.handleFeaturesResult(featuresResult)
    })

    it('outputs step totals, scenario totals, and duration', function() {
      expect(this.output).to.contain(
        '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
      )
    })
  })
})
