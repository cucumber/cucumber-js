import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import JsonFormatter from './json_formatter'
import Status from '../status'
import EventEmitter from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

describe('JsonFormatter', () => {
  beforeEach(function() {
    this.eventBroadcaster = new EventEmitter()
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.supportCodeLibrary = {
      beforeHookDefinitions: [{ id: uuidv4() }],
      afterHookDefinitions: [{ id: uuidv4() }],
      stepDefinitions: [
        {
          id: uuidv4(),
          line: 10,
          uri: 'steps.js',
        },
      ],
    }
    this.jsonFormatter = new JsonFormatter({
      cwd: '/project',
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      supportCodeLibrary: this.supportCodeLibrary,
      log: logFn,
    })
  })

  describe('no features', () => {
    beforeEach(function() {
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {},
        })
      )
    })

    it('outputs an empty array', function() {
      expect(JSON.parse(this.output)).to.eql([])
    })
  })

  describe('one scenario with one step', () => {
    beforeEach(async function() {
      const {
        pickles: [pickle],
      } = await generateEvents({
        data:
          '@tag1 @tag2\n' +
          'Feature: my feature\n' +
          'my feature description\n' +
          'Scenario: my scenario\n' +
          'my scenario description\n' +
          'Given my step',
        eventBroadcaster: this.eventBroadcaster,
        uri: '/project/a.feature',
      })
      this.pickle = pickle
    })

    describe('passed', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          status: Status.PASSED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [],
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('outputs the feature', function() {
        expect(JSON.parse(this.output)).to.eql([
          {
            description: 'my feature description',
            elements: [
              {
                description: 'my scenario description',
                id: 'my-feature;my-scenario',
                keyword: 'Scenario',
                line: 4,
                name: 'my scenario',
                type: 'scenario',
                steps: [
                  {
                    arguments: [],
                    line: 6,
                    keyword: 'Given ',
                    name: 'my step',
                    result: {
                      status: 'passed',
                      duration: 1,
                    },
                  },
                ],
                tags: [{ name: '@tag1', line: 1 }, { name: '@tag2', line: 1 }],
              },
            ],
            id: 'my-feature',
            keyword: 'Feature',
            line: 2,
            name: 'my feature',
            tags: [{ name: '@tag1', line: 1 }, { name: '@tag2', line: 1 }],
            uri: 'a.feature',
          },
        ])
      })
    })

    describe('retried', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId1 = uuidv4()
        const testCaseStartedId2 = uuidv4()
        const failingTestResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 2 }),
          exception: 'error',
          status: Status.FAILED,
        }
        const passingTestResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          status: Status.PASSED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [],
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId1,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId1,
              testStepId,
              testResult: failingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId1,
              testResult: { ...failingTestResult, willBeRetried: true },
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 1,
              id: testCaseStartedId2,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId2,
              testStepId,
              testResult: passingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId2,
              testResult: passingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('does not output retried test cases', function() {
        const features = JSON.parse(this.output)
        expect(features[0].elements.length).to.eql(1)
        expect(features[0].elements[0].steps[0].result).to.eql({
          status: 'passed',
          duration: 1,
        })
      })
    })

    describe('failed', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          message: 'my error',
          status: Status.FAILED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [],
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('includes the error message', function() {
        const features = JSON.parse(this.output)
        expect(features[0].elements[0].steps[0].result).to.eql({
          status: 'failed',
          error_message: 'my error',
          duration: 1,
        })
      })
    })

    describe('with a step definition', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          message: 'my error',
          status: Status.FAILED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[0].id,
                  ],
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('outputs the step with a match attribute', function() {
        const features = JSON.parse(this.output)
        expect(features[0].elements[0].steps[0].match).to.eql({
          location: 'steps.js:10',
        })
      })
    })

    describe('with hooks', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          message: 'my error',
          status: Status.FAILED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: uuidv4(),
                  stepDefinitionId: [],
                  hookId: this.supportCodeLibrary.beforeHookDefinitions[0].id,
                },
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[0].id,
                  ],
                },
                {
                  id: testStepId,
                  stepDefinitionId: [],
                  hookId: this.supportCodeLibrary.afterHookDefinitions[0].id,
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('outputs the before hook with special properties', function() {
        const features = JSON.parse(this.output)
        const beforeHook = features[0].elements[0].steps[0]
        expect(beforeHook).to.not.have.ownProperty('line')
        expect(beforeHook.keyword).to.eql('Before')
        expect(beforeHook.hidden).to.eql(true)
      })

      it('outputs the after hook with special properties', function() {
        const features = JSON.parse(this.output)
        const beforeHook = features[0].elements[0].steps[2]
        expect(beforeHook).to.not.have.ownProperty('line')
        expect(beforeHook.keyword).to.eql('After')
        expect(beforeHook.hidden).to.eql(true)
      })
    })

    describe('with attachments', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          duration: new messages.Duration({ seconds: 0, nanos: 1 }),
          status: Status.PASSED,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [],
                },
              ],
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit('envelope', {
          testStepAttachment: {
            testCaseStartedId,
            testStepId,
            data: 'first data',
            media: { type: 'first media type' },
          },
        })
        this.eventBroadcaster.emit('envelope', {
          testStepAttachment: {
            testCaseStartedId,
            testStepId,
            data: 'second data',
            media: { type: 'second media type' },
          },
        })
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {
              duration: 0,
            },
          })
        )
      })

      it('outputs the step with embeddings', function() {
        const features = JSON.parse(this.output)
        expect(features[0].elements[0].steps[0].embeddings).to.eql([
          { data: 'first data', mime_type: 'first media type' },
          { data: 'second data', mime_type: 'second media type' },
        ])
      })
    })
  })

  describe('one scenario with one step with a doc string', () => {
    beforeEach(async function() {
      const {
        pickles: [pickle],
      } = await generateEvents({
        data:
          'Feature: my feature\n' +
          '  Scenario: my scenario\n' +
          '    Given my step\n' +
          '      """\n' +
          '      This is a DocString\n' +
          '      """\n',
        eventBroadcaster: this.eventBroadcaster,
        uri: 'a.feature',
      })
      const testCaseId = uuidv4()
      const testStepId = uuidv4()
      const testCaseStartedId = uuidv4()
      const testResult = {
        duration: new messages.Duration({ seconds: 0, nanos: 1 }),
        status: Status.PASSED,
      }
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCase: {
            pickleId: pickle.id,
            id: testCaseId,
            testSteps: [
              {
                id: testStepId,
                pickleStepId: pickle.steps[0].id,
                stepDefinitionId: [],
              },
            ],
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            testCaseId,
            attempt: 0,
            id: testCaseStartedId,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testStepFinished: {
            testCaseStartedId,
            testStepId,
            testResult,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseFinished: {
            testCaseStartedId,
            testResult,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {
            duration: 0,
          },
        })
      )
    })

    it('outputs the doc string as a step argument', function() {
      const features = JSON.parse(this.output)
      expect(features[0].elements[0].steps[0].arguments).to.eql([
        {
          line: 4,
          content: 'This is a DocString',
        },
      ])
    })
  })

  describe('one scenario with one step with a data table string', () => {
    beforeEach(async function() {
      const {
        pickles: [pickle],
      } = await generateEvents({
        data:
          'Feature: my feature\n' +
          '  Scenario: my scenario\n' +
          '    Given my step\n' +
          '      |aaa|b|c|\n' +
          '      |d|e|ff|\n' +
          '      |gg|h|iii|\n',
        eventBroadcaster: this.eventBroadcaster,
        uri: 'a.feature',
      })
      const testCaseId = uuidv4()
      const testStepId = uuidv4()
      const testCaseStartedId = uuidv4()
      const testResult = {
        duration: new messages.Duration({ seconds: 0, nanos: 1 }),
        status: Status.PASSED,
      }
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCase: {
            pickleId: pickle.id,
            id: testCaseId,
            testSteps: [
              {
                id: testStepId,
                pickleStepId: pickle.steps[0].id,
                stepDefinitionId: [],
              },
            ],
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            testCaseId,
            attempt: 0,
            id: testCaseStartedId,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testStepFinished: {
            testCaseStartedId,
            testStepId,
            testResult,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseFinished: {
            testCaseStartedId,
            testResult,
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {
            duration: 0,
          },
        })
      )
    })

    it('outputs the data table as a step argument', function() {
      const features = JSON.parse(this.output)
      expect(features[0].elements[0].steps[0].arguments).to.eql([
        {
          rows: [
            { cells: ['aaa', 'b', 'c'] },
            { cells: ['d', 'e', 'ff'] },
            { cells: ['gg', 'h', 'iii'] },
          ],
        },
      ])
    })
  })
})
