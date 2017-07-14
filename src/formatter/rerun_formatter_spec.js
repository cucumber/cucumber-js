import _ from 'lodash'
import RerunFormatter from './rerun_formatter'
import Status from '../status'

describe('RerunFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.feature1Path = 'features/a.feature'
    this.feature2Path = 'features/b.feature'
    this.rerunFormatter = new RerunFormatter({
      log: logFn
    })
  })

  describe('with no scenarios', function() {
    beforeEach(function() {
      const featuresResult = { scenarioResults: [] }
      this.rerunFormatter.handleFeaturesResult(featuresResult)
    })

    it('outputs nothing', function() {
      expect(this.output).to.eql('')
    })
  })

  _.each([Status.PASSED], status => {
    describe('with one ' + status + ' scenario', function() {
      beforeEach(function() {
        const scenarioResult = { status }
        const featuresResult = { scenarioResults: [scenarioResult] }
        this.rerunFormatter.handleFeaturesResult(featuresResult)
      })

      it('outputs nothing', function() {
        expect(this.output).to.eql('')
      })
    })
  })

  _.each(
    [
      Status.AMBIGUOUS,
      Status.FAILED,
      Status.PENDING,
      Status.SKIPPED,
      Status.UNDEFINED
    ],
    status => {
      describe('with one ' + status + ' scenario', function() {
        beforeEach(function() {
          const scenario = {
            line: 1,
            uri: this.feature1Path
          }
          const scenarioResult = {
            scenario,
            status
          }
          const featuresResult = { scenarioResults: [scenarioResult] }
          this.rerunFormatter.handleFeaturesResult(featuresResult)
        })

        it('outputs the reference needed to run the scenario again', function() {
          expect(this.output).to.eql(`features/a.feature:1`)
        })
      })
    }
  )

  describe('with two failing scenarios in the same file', function() {
    beforeEach(function() {
      const scenario1 = {
        line: 1,
        uri: this.feature1Path
      }
      const scenarioResult1 = {
        scenario: scenario1,
        status: Status.FAILED
      }
      const scenario2 = {
        line: 2,
        uri: this.feature1Path
      }
      const scenarioResult2 = {
        scenario: scenario2,
        status: Status.FAILED
      }
      const featuresResult = {
        scenarioResults: [scenarioResult1, scenarioResult2]
      }
      this.rerunFormatter.handleFeaturesResult(featuresResult)
    })

    it('outputs the reference needed to run the scenarios again', function() {
      expect(this.output).to.eql(`features/a.feature:1:2`)
    })
  })

  describe('with two failing scenarios in different files', function() {
    beforeEach(function() {
      const scenario1 = {
        line: 1,
        uri: this.feature1Path
      }
      const scenarioResult1 = {
        scenario: scenario1,
        status: Status.FAILED
      }
      const scenario2 = {
        line: 2,
        uri: this.feature2Path
      }
      const scenarioResult2 = {
        scenario: scenario2,
        status: Status.FAILED
      }
      const featuresResult = {
        scenarioResults: [scenarioResult1, scenarioResult2]
      }
      this.rerunFormatter.handleFeaturesResult(featuresResult)
    })

    it('outputs the references needed to run the scenarios again', function() {
      expect(this.output).to.eql(`features/a.feature:1\nfeatures/b.feature:2`)
    })
  })
})
