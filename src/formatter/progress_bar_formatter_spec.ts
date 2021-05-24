import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { EventEmitter } from 'events'
import { EventDataCollector } from './helpers'
import {
  getEnvelopesAndEventDataCollector,
  ITestSource,
  normalizeSummaryDuration,
} from '../../test/formatter_helpers'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import FormatterBuilder from './builder'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { IRuntimeOptions } from '../runtime'
import * as messages from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import ProgressBarFormatter from './progress_bar_formatter'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { PassThrough } from 'stream'
import ProgressBar from 'progress'
import bluebird from 'bluebird'

interface ITestProgressBarFormatterOptions {
  runtimeOptions?: Partial<IRuntimeOptions>
  shouldStopFn: (envelope: messages.Envelope) => boolean
  sources?: ITestSource[]
  supportCodeLibrary?: ISupportCodeLibrary
}

interface ITestProgressBarFormatterOutput {
  output: string
  progressBarFormatter: ProgressBarFormatter
}

async function testProgressBarFormatter({
  runtimeOptions,
  shouldStopFn,
  sources,
  supportCodeLibrary,
}: ITestProgressBarFormatterOptions): Promise<ITestProgressBarFormatterOutput> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const { envelopes } = await getEnvelopesAndEventDataCollector({
    runtimeOptions,
    sources,
    supportCodeLibrary,
  })

  let output = ''
  const logFn = (data: string): void => {
    output += data
  }
  const passThrough = new PassThrough()
  const progressBarFormatter = FormatterBuilder.build('progress-bar', {
    cwd: '',
    eventBroadcaster,
    eventDataCollector: new EventDataCollector(eventBroadcaster),
    log: logFn,
    parsedArgvOptions: {},
    stream: passThrough,
    cleanup: bluebird.promisify(passThrough.end.bind(passThrough)),
    supportCodeLibrary,
  }) as ProgressBarFormatter
  let mocked = false
  for (const envelope of envelopes) {
    eventBroadcaster.emit('envelope', envelope)
    if (shouldStopFn(envelope)) {
      break
    }
    if (!mocked && doesHaveValue(envelope.testStepStarted)) {
      progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub(),
        render: sinon.stub(),
        update: sinon.stub(),
        terminate: sinon.stub(),
        complete: false,
        curr: null,
        total: null,
      }
      mocked = true
    }
  }
  return { progressBarFormatter, output: normalizeSummaryDuration(output) }
}

describe('ProgressBarFormatter', () => {
  describe('testStepStarted', () => {
    it('initializes a progress bar with the total number of steps for a scenario', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nScenario: b\nGiven a step\nThen a step',
          uri: 'a.feature',
        },
        {
          data:
            'Feature: a\nScenario: b\nGiven a step\nWhen a step\nThen a step',
          uri: 'b.feature',
        },
      ]

      // Act
      const { progressBarFormatter } = await testProgressBarFormatter({
        shouldStopFn: (envelope) => doesHaveValue(envelope.testStepStarted),
        sources,
      })

      // Assert
      expect(progressBarFormatter.progressBar.total).to.eql(5)
    })

    it('initializes a progress bar with the total number of steps for a rule', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nRule: b\nExample: c\nGiven a step\nThen a step',
          uri: 'a.feature',
        },
        {
          data:
            'Feature: a\nRule: b\nExample: c\nGiven a step\nWhen a step\nThen a step',
          uri: 'b.feature',
        },
      ]

      // Act
      const { progressBarFormatter } = await testProgressBarFormatter({
        shouldStopFn: (envelope) => doesHaveValue(envelope.testStepStarted),
        sources,
      })

      // Assert
      expect(progressBarFormatter.progressBar.total).to.eql(5)
    })
  })

  describe('testStepFinished', () => {
    describe('step is a hook', () => {
      it('does not increase the progress bar percentage', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Before, Given }) => {
            Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
            Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          }
        )

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testStepFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.tick).to.have.callCount(0)
      })
    })

    describe('step is from a pickle', () => {
      it('increases the progress bar percentage', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Before, Given }) => {
            Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
            Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          }
        )

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => false,
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.tick).to.have.callCount(1)
      })
    })
  })

  describe('testCaseFinished', () => {
    describe('ambiguous', () => {
      it('prints the error', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven an ambiguous step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(1)
      })
    })

    describe('failed', () => {
      it('prints the error', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a failed step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(1)
      })
    })

    describe('passed', () => {
      it('does not print anything', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a passing step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(0)
      })
    })

    describe('pending', () => {
      it('prints the warning', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a pending step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(1)
      })
    })

    describe('skipped', () => {
      it('does not print anything', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven a skipped step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(0)
      })
    })

    describe('undefined', () => {
      it('prints the warning', async () => {
        // Arrange
        const sources = [
          {
            data: 'Feature: a\nScenario: b\nGiven an undefined step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: (envelope) => doesHaveValue(envelope.testCaseFinished),
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(1)
      })
    })

    describe('retried', () => {
      it('prints the warning and ticks a negative amount as the testCase will be retried', async () => {
        // Arrange
        const sources = [
          {
            data:
              'Feature: a\nScenario: b\nGiven a passing step\n When a flaky step\nThen a passing step',
            uri: 'a.feature',
          },
        ]
        const supportCodeLibrary = getBaseSupportCodeLibrary()

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          runtimeOptions: { retry: 1 },
          shouldStopFn: (envelope) => false,
          sources,
          supportCodeLibrary,
        })
        const progressBar = progressBarFormatter.progressBar as sinon.SinonStubbedInstance<ProgressBar>

        // Assert
        expect(progressBar.interrupt).to.have.callCount(1)
        expect(progressBar.tick).to.have.callCount(7)
        expect(progressBar.tick.args).to.deep.eq([[], [], [], [-3], [], [], []])
      })
    })
  })

  describe('testRunFinished', () => {
    let clock: InstalledClock

    beforeEach(() => {
      clock = FakeTimers.withGlobal(timeMethods).install()
    })

    afterEach(() => {
      clock.uninstall()
    })

    it('outputs step totals, scenario totals, and duration - singular', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nScenario: b\nGiven a passing step',
          uri: 'a.feature',
        },
      ]
      const supportCodeLibrary = getBaseSupportCodeLibrary()

      // Act
      const { output } = await testProgressBarFormatter({
        shouldStopFn: (envelope) => false,
        sources,
        supportCodeLibrary,
      })

      // Assert
      expect(output).to.contain(
        '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '<duration-stat>\n'
      )
    })

    it('outputs step totals, scenario totals, and duration - plural', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nScenario: b\nGiven a passing step',
          uri: 'a.feature',
        },
        {
          data: 'Feature: a\nRule: b\nExample: c\nGiven a passing step',
          uri: 'b.feature',
        },
      ]
      const supportCodeLibrary = getBaseSupportCodeLibrary()

      // Act
      const { output } = await testProgressBarFormatter({
        shouldStopFn: (envelope) => false,
        sources,
        supportCodeLibrary,
      })

      // Assert
      expect(output).to.contain(
        '2 scenarios (2 passed)\n' +
          '2 steps (2 passed)\n' +
          '<duration-stat>\n'
      )
    })
  })

  describe('undefinedParameterType', function () {
    it('outputs undefined parameter types', async () => {
      // Arrange
      const sources = [
        {
          data: 'Feature: a\nScenario: b\nGiven a step',
          uri: 'a.feature',
        },
      ]
      const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
        Given('a step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        Given('a {param} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        Given('another {param} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
        Given('a different {foo} step', function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
      })

      // Act
      const { output } = await testProgressBarFormatter({
        shouldStopFn: (envelope) => false,
        sources,
        supportCodeLibrary,
      })

      // Assert
      // Assert
      expect(output).to.contain(
        `Undefined parameter type: "param" e.g. \`a {param} step\`
Undefined parameter type: "param" e.g. \`another {param} step\`
Undefined parameter type: "foo" e.g. \`a different {foo} step\`
`
      )
    })
  })
})
