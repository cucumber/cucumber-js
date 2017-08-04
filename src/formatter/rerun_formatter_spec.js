import _ from 'lodash'
import path from 'path'
import RerunFormatter from './rerun_formatter'
import Status from '../status'
import { EventEmitter } from 'events'

describe('RerunFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.eventBroadcaster = new EventEmitter()
    this.feature1Path = path.join('features', 'a.feature')
    this.feature2Path = path.join('features', 'b.feature')
    this.rerunFormatter = new RerunFormatter({
      eventBroadcaster: this.eventBroadcaster,
      log: logFn
    })
  })

  describe('with no scenarios', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs nothing', function() {
      expect(this.output).to.eql('')
    })
  })

  _.each([Status.PASSED], status => {
    describe('with one ' + status + ' scenario', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: { uri: this.feature1Path, line: 1 },
          result: { status }
        })
        this.eventBroadcaster.emit('test-run-finished')
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
          this.eventBroadcaster.emit('test-case-finished', {
            sourceLocation: { uri: this.feature1Path, line: 1 },
            result: { status }
          })
          this.eventBroadcaster.emit('test-run-finished')
        })

        it('outputs the reference needed to run the scenario again', function() {
          expect(this.output).to.eql(`${this.feature1Path}:1`)
        })
      })
    }
  )

  describe('with two failing scenarios in the same file', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-case-finished', {
        sourceLocation: { uri: this.feature1Path, line: 1 },
        result: { status: Status.FAILED }
      })
      this.eventBroadcaster.emit('test-case-finished', {
        sourceLocation: { uri: this.feature1Path, line: 2 },
        result: { status: Status.FAILED }
      })
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs the reference needed to run the scenarios again', function() {
      expect(this.output).to.eql(`${this.feature1Path}:1:2`)
    })
  })

  describe('with two failing scenarios in different files', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-case-finished', {
        sourceLocation: { uri: this.feature1Path, line: 1 },
        result: { status: Status.FAILED }
      })
      this.eventBroadcaster.emit('test-case-finished', {
        sourceLocation: { uri: this.feature2Path, line: 2 },
        result: { status: Status.FAILED }
      })
      this.eventBroadcaster.emit('test-run-finished')
    })

    it('outputs the references needed to run the scenarios again', function() {
      expect(this.output).to.eql(
        `${this.feature1Path}:1\n` + `${this.feature2Path}:2`
      )
    })
  })
})
