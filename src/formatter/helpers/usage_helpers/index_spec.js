import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getUsage } from './'
import EventEmitter from 'events'
import Gherkin from 'gherkin'
import EventDataCollector from '../event_data_collector'

describe('Usage Helpers', () => {
  describe('getUsage', () => {
    beforeEach(function() {
      this.eventBroadcaster = new EventEmitter()
      this.eventDataCollector = new EventDataCollector(this.eventBroadcaster)
      this.stepDefinitions = []
      this.getResult = () =>
        getUsage({
          eventDataCollector: this.eventDataCollector,
          stepDefinitions: this.stepDefinitions,
        })
    })

    describe('no step definitions', () => {
      describe('without steps', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit('test-run-finished')
        })

        it('returns an empty array', function() {
          expect(this.getResult()).to.eql([])
        })
      })

      describe('with a step', () => {
        beforeEach(function() {
          const events = Gherkin.generateEvents(
            'Feature: a\nScenario: b\nWhen abc\nThen ab',
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
          const testCase = {
            attemptNumber: 1,
            sourceLocation: { uri: 'a.feature', line: 2 },
          }
          this.eventBroadcaster.emit('test-case-prepared', {
            ...testCase,
            steps: [
              { sourceLocation: { uri: 'a.feature', line: 3 } },
              { sourceLocation: { uri: 'a.feature', line: 4 } },
            ],
          })
          this.eventBroadcaster.emit('test-case-started', testCase)
          this.eventBroadcaster.emit('test-step-finished', {
            index: 0,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-step-finished', {
            index: 1,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-case-finished', {
            ...testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-run-finished')
        })

        it('returns an empty array', function() {
          expect(this.getResult()).to.eql([])
        })
      })
    })
  })
})
