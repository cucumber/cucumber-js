import { beforeEach, afterEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { EventEmitter } from 'events'
import { EventDataCollector } from './helpers'
import {
  getEnvelopesAndEventDataCollector,
  ITestSource,
} from '../../test/formatter_helpers'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import FormatterBuilder from './builder'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import lolex from 'lolex'
import timeMethods from '../time'
import { IRuntimeOptions } from '../runtime'
import { messages } from 'cucumber-messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import ProgressBarFormatter from './progress_bar_formatter'
import { doesHaveValue } from '../value_checker'

interface ITestProgressBarFormatterOptions {
  runtimeOptions?: Partial<IRuntimeOptions>
  shouldStopFn: (envelope: messages.IEnvelope) => boolean
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
  if (!supportCodeLibrary) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const { envelopes } = await getEnvelopesAndEventDataCollector({
    runtimeOptions,
    sources,
    supportCodeLibrary,
  })
  const eventBroadcaster = new EventEmitter()
  let output = ''
  const logFn = data => {
    output += data
  }
  const progressBarFormatter = FormatterBuilder.build('progress-bar', {
    cwd: '',
    eventBroadcaster,
    eventDataCollector: new EventDataCollector(eventBroadcaster),
    log: logFn,
    stream: {},
    supportCodeLibrary,
  }) as ProgressBarFormatter
  let mocked = false
  for (const envelope of envelopes) {
    eventBroadcaster.emit('envelope', envelope)
    if (shouldStopFn(envelope)) {
      break
    }
    if (!mocked && envelope.testStepStarted) {
      progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub(),
      }
      mocked = true
    }
  }
  return { progressBarFormatter, output }
}

describe('ProgressBarFormatter', () => {
  describe('pickleAccepted / testStepStarted', () => {
    it('initializes a progress bar with the total number of steps', async () => {
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
        shouldStopFn: envelope => doesHaveValue(envelope.testStepStarted),
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
            Given('a step', function() {})
            Before(function() {})
          }
        )

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: envelope => doesHaveValue(envelope.testStepFinished),
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
            Given('a step', function() {})
            Before(function() {})
          }
        )

        // Act
        const { progressBarFormatter } = await testProgressBarFormatter({
          shouldStopFn: envelope => false,
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => doesHaveValue(envelope.testCaseFinished),
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
          shouldStopFn: envelope => false,
          sources,
          supportCodeLibrary,
        })

        // Assert
        expect(progressBarFormatter.progressBar.interrupt).to.have.callCount(1)
        expect(progressBarFormatter.progressBar.tick).to.have.callCount(7)
        expect(progressBarFormatter.progressBar.tick.args).to.eql([
          [],
          [],
          [],
          [-3],
          [],
          [],
          [],
        ])
      })
    })
  })

  describe('testRunFinished', () => {
    let clock

    beforeEach(() => {
      clock = lolex.install({ target: timeMethods })
    })

    afterEach(() => {
      clock.uninstall()
    })

    it('outputs step totals, scenario totals, and duration', async () => {
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
        shouldStopFn: envelope => false,
        sources,
        supportCodeLibrary,
      })

      // Assert
      expect(output).to.contain(
        '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
      )
    })
  })
})
