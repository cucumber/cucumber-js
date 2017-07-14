import getColorFns from './get_color_fns'
import Hook from '../models/hook'
import ProgressFormatter from './progress_formatter'
import Status from '../status'
import Step from '../models/step'
import SummaryFormatter from './summary_formatter'

describe('ProgressFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const colorFns = getColorFns(false)
    const logFn = data => {
      this.output += data
    }
    this.progressFormatter = new ProgressFormatter({
      colorFns,
      log: logFn
    })
    sinon.stub(SummaryFormatter.prototype, 'handleFeaturesResult')
  })

  afterEach(function() {
    SummaryFormatter.prototype.handleFeaturesResult.restore()
  })

  describe('step result', function() {
    describe('step is a hook', function() {
      beforeEach(function() {
        this.stepResult = {
          status: null,
          step: Object.create(Hook.prototype)
        }
      })

      describe('failed', function() {
        beforeEach(function() {
          this.stepResult.status = Status.FAILED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs F', function() {
          expect(this.output).to.eql('F')
        })
      })

      describe('passed', function() {
        beforeEach(function() {
          this.stepResult.status = Status.PASSED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('does not output', function() {
          expect(this.output).to.eql('')
        })
      })

      describe('pending', function() {
        beforeEach(function() {
          this.stepResult.status = Status.PENDING
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs P', function() {
          expect(this.output).to.eql('P')
        })
      })

      describe('skipped', function() {
        beforeEach(function() {
          this.stepResult.status = Status.SKIPPED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs -', function() {
          expect(this.output).to.eql('-')
        })
      })
    })

    describe('step is a normal step', function() {
      beforeEach(function() {
        this.stepResult = createMock({
          status: null,
          step: Object.create(Step.prototype)
        })
      })

      describe('ambiguous', function() {
        beforeEach(function() {
          this.stepResult.status = Status.AMBIGUOUS
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs A', function() {
          expect(this.output).to.eql('A')
        })
      })

      describe('failed', function() {
        beforeEach(function() {
          this.stepResult.status = Status.FAILED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs F', function() {
          expect(this.output).to.eql('F')
        })
      })

      describe('passed', function() {
        beforeEach(function() {
          this.stepResult.status = Status.PASSED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs a dot', function() {
          expect(this.output).to.eql('.')
        })
      })

      describe('pending', function() {
        beforeEach(function() {
          this.stepResult.status = Status.PENDING
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs P', function() {
          expect(this.output).to.eql('P')
        })
      })

      describe('skipped', function() {
        beforeEach(function() {
          this.stepResult.status = Status.SKIPPED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs -', function() {
          expect(this.output).to.eql('-')
        })
      })

      describe('undefined', function() {
        beforeEach(function() {
          this.stepResult.status = Status.UNDEFINED
          this.progressFormatter.handleStepResult(this.stepResult)
        })

        it('outputs U', function() {
          expect(this.output).to.eql('U')
        })
      })
    })
  })

  describe('features result', function() {
    beforeEach(function() {
      this.featuresResult = { some: 'data' }
      this.progressFormatter.handleFeaturesResult(this.featuresResult)
    })

    it('outputs two newlines to separate the step results from the summary output', function() {
      expect(this.output).to.eql('\n\n')
    })

    describe('summary formatter', function() {
      it('handleFeaturesResult is also called', function() {
        expect(SummaryFormatter.prototype.handleFeaturesResult).to.have.been
          .calledOnce
        expect(
          SummaryFormatter.prototype.handleFeaturesResult
        ).to.have.been.calledWith(this.featuresResult)
      })
    })
  })
})
