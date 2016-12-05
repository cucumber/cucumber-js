import _ from 'lodash'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import JsonFormatter from './json_formatter'
import Status from '../status'

describe('JsonFormatter', function () {
  beforeEach(function () {
    this.output = ''
    const logFn = (data) => {
      this.output += data
    }
    this.jsonFormatter = new JsonFormatter({log: logFn})
  })

  describe('no features', function () {
    beforeEach(function () {
      this.jsonFormatter.handleAfterFeatures()
    })

    it('outputs an empty array', function () {
      expect(JSON.parse(this.output)).to.eql([])
    })
  })

  describe('one feature', function() {
    beforeEach(function () {
      const tag1 = {name: 'tag 1', line: 1}
      const tag2 = {name: 'tag 2', line: 1}
      const feature = {
        keyword: 'Feature',
        name: 'A Feature Name',
        description: 'A Feature Description',
        line: 2,
        uri: 'uri',
        tags: [tag1, tag2]
      }
      this.jsonFormatter.handleBeforeFeature(feature)
    })

    describe('with no scenarios', function () {
      beforeEach(function () {
        this.jsonFormatter.handleAfterFeatures()
      })

      it('outputs the feature', function () {
        expect(JSON.parse(this.output)).to.eql([{
          description: 'A Feature Description',
          elements: [],
          id: 'a-feature-name',
          keyword: 'Feature',
          line: 2,
          name: 'A Feature Name',
          tags: [
            {name: 'tag 1', line: 1},
            {name: 'tag 2', line: 1}
          ],
          uri: 'uri'
        }])
      })
    })

    describe('with a scenario', function () {
      beforeEach(function () {
        const tag1 = {name: 'tag 1', line: 3}
        const tag2 = {name: 'tag 2', line: 3}
        const scenario = {
          keyword: 'Scenario',
          name: 'A Scenario Name',
          description: 'A Scenario Description',
          line: 4,
          tags: [tag1, tag2]
        }
        this.jsonFormatter.handleBeforeScenario(scenario)
      })

      describe('with no steps', function () {
        beforeEach(function () {
          this.jsonFormatter.handleAfterFeatures()
        })

        it('outputs the scenario', function () {
          const features = JSON.parse(this.output)
          expect(features[0].elements).to.eql([{
            description: 'A Scenario Description',
            id: 'a-feature-name;a-scenario-name',
            keyword: 'Scenario',
            line: 4,
            name: 'A Scenario Name',
            steps: [],
            tags: [
              {name: 'tag 1', line: 3},
              {name: 'tag 2', line: 3}
            ]
          }])
        })
      })

      describe('with a step', function () {
        beforeEach(function() {
          this.step = {
            arguments: [],
            line: 1,
            keyword: 'Step',
            name: 'A Step Name',
            isHidden: false
          }

          this.stepResult = {
            duration: 1,
            failureException: null,
            status: Status.PASSED,
            step: this.step,
            stepDefinition: null,
            attachments: []
          }
        })

        describe('that is passing', function () {
          beforeEach(function() {
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures()
          })

          it('outputs the step', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps).to.eql([{
              arguments: [],
              line: 1,
              keyword: 'Step',
              name: 'A Step Name',
              result: {
                status: 'passed',
                duration: 1
              }
            }])
          })
        })

        describe('that is failing', function () {
          beforeEach(function() {
            this.stepResult.status = Status.FAILED
            this.stepResult.failureException = {stack: 'failure stack'}
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures()
          })

          it('outputs the step with the error message', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps[0].result).to.eql({
              status: 'failed',
              error_message: 'failure stack',
              duration: 1
            })
          })
        })

        describe('that is background', function () {
          beforeEach(function() {
            this.step.isBackground = true
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures({})
          })

          it('outputs a isBackground attribute', function () {
            const features = JSON.parse(this.output)
            const step = features[0].elements[0].steps[0]
            expect(step.isBackground).to.be.true
          })
        })

        describe('that is hidden', function () {
          beforeEach(function() {
            this.step.constructor = {name: 'Hook'}
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures({})
          })

          it('does not output a line attribute and outputs a hidden attribute', function () {
            const features = JSON.parse(this.output)
            const step = features[0].elements[0].steps[0]
            expect(step).to.not.have.ownProperty('line')
            expect(step.hidden).to.be.true
          })
        })

        describe('with a doc string', function () {
          beforeEach(function (){
            const docString = Object.create(DocString.prototype)
            _.assign(docString, {
              content: 'This is a DocString',
              contentType: null,
              line: 2
            })
            this.step.arguments = [docString]
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures({})
          })

          it('outputs the doc string as a step argument', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps[0].arguments).to.eql([{
              line: 2,
              content: 'This is a DocString',
              contentType: null
            }])
          })
        })

        describe('with a data table', function () {
          beforeEach(function (){
            const dataTable = Object.create(DataTable.prototype)
            _.assign(dataTable, createMock({
              raw: [
                ['a:1', 'a:2', 'a:3'],
                ['b:1', 'b:2', 'b:3'],
                ['c:1', 'c:2', 'c:3']
              ]
            }))
            this.step.arguments = [dataTable]
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures()
          })

          it('outputs the data table as a step argument', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps[0].arguments).to.eql([{
              rows: [
                {cells: ['a:1', 'a:2', 'a:3']},
                {cells: ['b:1', 'b:2', 'b:3']},
                {cells: ['c:1', 'c:2', 'c:3']}
              ]
            }])
          })
        })

        describe('with an unknown argument type', function () {
          beforeEach(function (){
            this.step.arguments = [{some: 'data'}]
          })

          it('throws an arror', function () {
            expect(() => {
              this.jsonFormatter.handleStepResult(this.stepResult)
            }).to.throw('Unknown argument type: { some: \'data\' }')
          })
        })

        describe('with attachments', function () {
          beforeEach(function (){
            const attachment1 = {
              mimeType: 'first mime type',
              data: 'first data'
            }
            const attachment2 = {
              mimeType: 'second mime type',
              data: 'second data'
            }
            this.stepResult.attachments = [attachment1, attachment2]
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures({})
          })

          it('outputs the step with embeddings', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps[0].embeddings).to.eql([
              {data: 'first data', mime_type: 'first mime type'},
              {data: 'second data', mime_type: 'second mime type'}
            ])
          })
        })

        describe('with a step definition', function () {
          beforeEach(function (){
            const stepDefinition = {
              line: 2,
              uri: 'path/to/stepDef'
            }
            this.stepResult.stepDefinition = stepDefinition
            this.jsonFormatter.handleStepResult(this.stepResult)
            this.jsonFormatter.handleAfterFeatures({})
          })

          it('outputs the step with a match attribute', function () {
            const features = JSON.parse(this.output)
            expect(features[0].elements[0].steps[0].match).to.eql({
              location: 'path/to/stepDef:2'
            })
          })
        })
      })
    })
  })
})
