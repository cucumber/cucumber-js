import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import _ from 'lodash'
import RerunFormatter from './rerun_formatter'
import { EventEmitter } from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import Runtime from '../runtime/index'
import {
  buildOptions,
  buildSupportCodeLibrary,
} from '../../test/runtime_helpers'

function prepareFormatter(options = {}) {
  this.output = ''
  const logFn = data => {
    this.output += data
  }
  this.eventBroadcaster = new EventEmitter()
  this.eventDataCollector = new EventDataCollector(this.eventBroadcaster)
  this.rerunFormatter = new RerunFormatter({
    ...options,
    cwd: '/project',
    eventBroadcaster: this.eventBroadcaster,
    eventDataCollector: this.eventDataCollector,
    log: logFn,
  })
}

describe('RerunFormatter', () => {
  beforeEach(prepareFormatter)

  describe('with no scenarios', () => {
    beforeEach(async function() {
      const runtime = new Runtime({
        eventBroadcaster: this.eventBroadcaster,
        eventDataCollector: this.eventDataCollector,
        options: buildOptions(),
        pickleIds: [],
        supportCodeLibrary: buildSupportCodeLibrary(),
      })
      await runtime.start()
    })

    it('outputs nothing', function() {
      expect(this.output).to.eql('')
    })
  })

  describe(`with one scenario`, () => {
    let pickle

    beforeEach(async function() {
      const generated = await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: '/project/a.feature',
      })
      pickle = generated.pickles[0]
    })

    describe('passed', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions(),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(
            __dirname,
            ({ Given }) => {
              Given('a step', function() {})
            }
          ),
        })
        await runtime.start()
      })

      it('outputs nothing', function() {
        expect(this.output).to.eql('')
      })
    })

    describe('ambiguous', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions(),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(
            __dirname,
            ({ Given }) => {
              Given('a step', function() {})
              Given('a step', function() {})
            }
          ),
        })
        await runtime.start()
      })

      it('outputs the reference needed to run the scenario again', function() {
        expect(this.output).to.eql('a.feature:2')
      })
    })

    describe('failed', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions(),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(
            __dirname,
            ({ Given }) => {
              Given('a step', function() {
                throw new Error('error')
              })
            }
          ),
        })
        await runtime.start()
      })

      it('outputs the reference needed to run the scenario again', function() {
        expect(this.output).to.eql('a.feature:2')
      })
    })

    describe('pending', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions(),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(
            __dirname,
            ({ Given }) => {
              Given('a step', function() {
                return 'pending'
              })
            }
          ),
        })
        await runtime.start()
      })

      it('outputs the reference needed to run the scenario again', function() {
        expect(this.output).to.eql('a.feature:2')
      })
    })

    describe('skipped', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions({ dryRun: true }),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(
            __dirname,
            ({ Given }) => {
              Given('a step', function() {})
            }
          ),
        })
        await runtime.start()
      })

      it('outputs the reference needed to run the scenario again', function() {
        expect(this.output).to.eql('a.feature:2')
      })
    })

    describe('undefined', () => {
      beforeEach(async function() {
        const runtime = new Runtime({
          eventBroadcaster: this.eventBroadcaster,
          eventDataCollector: this.eventDataCollector,
          options: buildOptions({ dryRun: true }),
          pickleIds: [pickle.id],
          supportCodeLibrary: buildSupportCodeLibrary(),
        })
        await runtime.start()
      })

      it('outputs the reference needed to run the scenario again', function() {
        expect(this.output).to.eql('a.feature:2')
      })
    })
  })

  describe('with two failing scenarios in the same file', () => {
    beforeEach(async function() {
      const { pickles } = await generateEvents({
        data:
          'Feature: a\nScenario: b\nGiven a step\nScenario: c\nGiven a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: '/project/a.feature',
      })
      const runtime = new Runtime({
        eventBroadcaster: this.eventBroadcaster,
        eventDataCollector: this.eventDataCollector,
        options: buildOptions({ dryRun: true }),
        pickleIds: pickles.map(p => p.id),
        supportCodeLibrary: buildSupportCodeLibrary(__dirname, ({ Given }) => {
          Given('a step', function() {})
        }),
      })
      await runtime.start()
    })

    it('outputs the reference needed to run the scenarios again', function() {
      expect(this.output).to.eql(`a.feature:2:4`)
    })
  })

  _.each(
    [
      { separator: { opt: undefined, expected: '\n' }, label: 'default' },
      { separator: { opt: '\n', expected: '\n' }, label: 'newline' },
      { separator: { opt: ' ', expected: ' ' }, label: 'space' },
    ],
    ({ separator, label }) => {
      describe(`using ${label} separator`, () => {
        describe('with two failing scenarios in different files', () => {
          beforeEach(async function() {
            prepareFormatter.apply(this, [
              { rerun: { separator: separator.opt } },
            ])

            const {
              pickles: [pickle1],
            } = await generateEvents({
              data: 'Feature: a\nScenario: b\nGiven a step',
              eventBroadcaster: this.eventBroadcaster,
              uri: '/project/a.feature',
            })
            const {
              pickles: [pickle2],
            } = await generateEvents({
              data: 'Feature: a\n\nScenario: b\nGiven a step',
              eventBroadcaster: this.eventBroadcaster,
              uri: '/project/b.feature',
            })
            const runtime = new Runtime({
              eventBroadcaster: this.eventBroadcaster,
              eventDataCollector: this.eventDataCollector,
              options: buildOptions({ dryRun: true }),
              pickleIds: [pickle1.id, pickle2.id],
              supportCodeLibrary: buildSupportCodeLibrary(
                __dirname,
                ({ Given }) => {
                  Given('a step', function() {})
                }
              ),
            })
            await runtime.start()
          })

          it('outputs the references needed to run the scenarios again', function() {
            expect(this.output).to.eql(
              `a.feature:2${separator.expected}b.feature:3`
            )
          })
        })
      })
    }
  )
})
