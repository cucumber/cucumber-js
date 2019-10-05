import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import JsonFormatter from './json_formatter'
import Status from '../status'
import EventEmitter from 'events'
import Gherkin from 'gherkin'
import { EventDataCollector } from './helpers'

describe('JsonFormatter', () => {
  beforeEach(function() {
    this.eventBroadcaster = new EventEmitter()
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.jsonFormatter = new JsonFormatter({
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: logFn,
    })
  })

  describe('no features', () => {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs an empty array', function() {
      expect(JSON.parse(this.output)).to.eql({
        gherkinDocuments: [],
        pickles: [],
        testCaseAttempts: [],
      })
    })
  })

  describe('one scenario with one step', () => {
    beforeEach(function() {
      const events = Gherkin.generateEvents(
        '@tag1 @tag2\n' +
          'Feature: my feature\n' +
          'my feature description\n' +
          'Scenario: my scenario\n' +
          'my scenario description\n' +
          'Given my step',
        'a.feature'
      )
      events.forEach(event => {
        this.eventBroadcaster.emit(event.type, event)
        if (event.type === 'pickle') {
          this.eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri,
          })
        }
      })
      this.testCase = {
        sourceLocation: { uri: 'a.feature', line: 4 },
        attemptNumber: 1,
      }
    })

    describe('passed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          ...this.testCase,
          steps: [
            {
              actionLocation: { uri: 'steps.js', line: 2 },
              sourceLocation: { uri: 'a.feature', line: 6 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-case-started', this.testCase)
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          ...this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-run-finished')
      })

      it('outputs the feature', function() {
        expect(JSON.parse(this.output)).to.eql({
          gherkinDocuments: [
            {
              comments: [],
              feature: {
                children: [
                  {
                    description: 'my scenario description',
                    keyword: 'Scenario',
                    location: {
                      column: 1,
                      line: 4,
                    },
                    name: 'my scenario',
                    steps: [
                      {
                        keyword: 'Given ',
                        location: {
                          column: 1,
                          line: 6,
                        },
                        text: 'my step',
                        type: 'Step',
                      },
                    ],
                    tags: [],
                    type: 'Scenario',
                  },
                ],
                description: 'my feature description',
                keyword: 'Feature',
                language: 'en',
                location: {
                  column: 1,
                  line: 2,
                },
                name: 'my feature',
                tags: [
                  {
                    location: {
                      column: 1,
                      line: 1,
                    },
                    name: '@tag1',
                    type: 'Tag',
                  },
                  {
                    location: {
                      column: 7,
                      line: 1,
                    },
                    name: '@tag2',
                    type: 'Tag',
                  },
                ],
                type: 'Feature',
              },
              type: 'GherkinDocument',
              uri: 'a.feature',
            },
          ],
          pickles: [
            {
              language: 'en',
              locations: [
                {
                  column: 1,
                  line: 4,
                },
              ],
              name: 'my scenario',
              steps: [
                {
                  arguments: [],
                  locations: [
                    {
                      column: 7,
                      line: 6,
                    },
                  ],
                  text: 'my step',
                },
              ],
              tags: [
                {
                  location: {
                    column: 1,
                    line: 1,
                  },
                  name: '@tag1',
                },
                {
                  location: {
                    column: 7,
                    line: 1,
                  },
                  name: '@tag2',
                },
              ],
              uri: 'a.feature',
            },
          ],
          testCaseAttempts: [
            {
              testCase: {
                attemptNumber: 1,
                name: 'my scenario',
                result: { duration: 1, status: 'passed' },
                sourceLocation: { uri: 'a.feature', line: 4 },
              },
              testSteps: [
                {
                  actionLocation: { uri: 'steps.js', line: 2 },
                  arguments: [],
                  attachments: [],
                  keyword: 'Given ',
                  result: { duration: 1, status: 'passed' },
                  sourceLocation: { uri: 'a.feature', line: 6 },
                  text: 'my step',
                },
              ],
            },
          ],
        })
      })
    })

    describe('failed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          ...this.testCase,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 6 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-case-started', this.testCase)
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { duration: 1, exception: 'my error', status: Status.FAILED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          ...this.testCase,
          result: { duration: 1, status: Status.FAILED },
        })
        this.eventBroadcaster.emit('test-run-finished')
      })

      it('includes the error message', function() {
        const result = JSON.parse(this.output)
        expect(result.testCaseAttempts[0].testSteps[0].result).to.eql({
          status: 'failed',
          exception: 'my error',
          duration: 1,
        })
      })
    })

    describe('with hooks', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          ...this.testCase,
          steps: [
            {
              actionLocation: { uri: 'steps.js', line: 10 },
            },
            {
              sourceLocation: { uri: 'a.feature', line: 6 },
              actionLocation: { uri: 'steps.js', line: 11 },
            },
            {
              actionLocation: { uri: 'steps.js', line: 12 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-case-started', this.testCase)
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 1,
          testCase: this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 2,
          testCase: this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          ...this.testCase,
          result: { duration: 3, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-run-finished')
      })

      it('outputs the before hook with proper keyword and action location', function() {
        const result = JSON.parse(this.output)
        const beforeHook = result.testCaseAttempts[0].testSteps[0]
        expect(beforeHook.actionLocation).to.eql({ uri: 'steps.js', line: 10 })
        expect(beforeHook.keyword).to.eql('Before')
      })

      it('outputs the after hook with special properties', function() {
        const result = JSON.parse(this.output)
        const beforeHook = result.testCaseAttempts[0].testSteps[2]
        expect(beforeHook.actionLocation).to.eql({ uri: 'steps.js', line: 12 })
        expect(beforeHook.keyword).to.eql('After')
      })
    })

    describe('with attachments', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          ...this.testCase,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 6 },
              actionLocation: { uri: 'steps.js', line: 11 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-case-started', this.testCase)
        this.eventBroadcaster.emit('test-step-attachment', {
          testCase: this.testCase,
          index: 0,
          data: 'first data',
          media: { type: 'first media type' },
        })
        this.eventBroadcaster.emit('test-step-attachment', {
          testCase: this.testCase,
          index: 0,
          data: 'second data',
          media: { type: 'second media type' },
        })
        this.eventBroadcaster.emit('test-step-finished', {
          testCase: this.testCase,
          index: 0,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          ...this.testCase,
          result: { duration: 1, status: Status.PASSED },
        })
        this.eventBroadcaster.emit('test-run-finished')
      })

      it('outputs the step attachments', function() {
        const result = JSON.parse(this.output)
        expect(result.testCaseAttempts[0].testSteps[0].attachments).to.eql([
          { data: 'first data', media: { type: 'first media type' } },
          { data: 'second data', media: { type: 'second media type' } },
        ])
      })
    })
  })

  describe('one scenario with one step with a doc string', () => {
    beforeEach(function() {
      const events = Gherkin.generateEvents(
        'Feature: my feature\n' +
          '  Scenario: my scenario\n' +
          '    Given my step\n' +
          '      """\n' +
          '      This is a DocString\n' +
          '      """\n',
        'a.feature'
      )
      events.forEach(event => {
        this.eventBroadcaster.emit(event.type, event)
        if (event.type === 'pickle') {
          this.eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri,
          })
        }
      })
      this.testCase = {
        sourceLocation: { uri: 'a.feature', line: 2 },
        attemptNumber: 1,
      }
      this.eventBroadcaster.emit('test-case-prepared', {
        ...this.testCase,
        steps: [
          {
            sourceLocation: { uri: 'a.feature', line: 3 },
            actionLocation: { uri: 'steps.js', line: 10 },
          },
        ],
      })
      this.eventBroadcaster.emit('test-case-started', this.testCase)
      this.eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase: this.testCase,
        result: { duration: 1, status: Status.PASSED },
      })
      this.eventBroadcaster.emit('test-case-finished', {
        ...this.testCase,
        result: { duration: 1, status: Status.PASSED },
      })
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs the doc string as a step argument', function() {
      const result = JSON.parse(this.output)
      expect(result.testCaseAttempts[0].testSteps[0].arguments).to.eql([
        {
          content: 'This is a DocString',
        },
      ])
    })
  })

  describe('one scenario with one step with a data table string', () => {
    beforeEach(function() {
      const events = Gherkin.generateEvents(
        'Feature: my feature\n' +
          '  Scenario: my scenario\n' +
          '    Given my step\n' +
          '      |aaa|b|c|\n' +
          '      |d|e|ff|\n' +
          '      |gg|h|iii|\n',
        'a.feature'
      )
      events.forEach(event => {
        this.eventBroadcaster.emit(event.type, event)
        if (event.type === 'pickle') {
          this.eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri,
          })
        }
      })
      this.testCase = {
        sourceLocation: { uri: 'a.feature', line: 2 },
        attemptNumber: 1,
      }
      this.eventBroadcaster.emit('test-case-prepared', {
        ...this.testCase,
        steps: [
          {
            sourceLocation: { uri: 'a.feature', line: 3 },
            actionLocation: { uri: 'steps.js', line: 10 },
          },
        ],
      })
      this.eventBroadcaster.emit('test-case-started', this.testCase)
      this.eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase: this.testCase,
        result: { duration: 1, status: Status.PASSED },
      })
      this.eventBroadcaster.emit('test-case-finished', {
        ...this.testCase,
        result: { duration: 1, status: Status.PASSED },
      })
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs the data table as a step argument', function() {
      const result = JSON.parse(this.output)
      expect(result.testCaseAttempts[0].testSteps[0].arguments).to.eql([
        {
          rows: [['aaa', 'b', 'c'], ['d', 'e', 'ff'], ['gg', 'h', 'iii']],
        },
      ])
    })
  })
})
