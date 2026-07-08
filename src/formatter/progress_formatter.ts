import { type Envelope, type TestStepFinished, TestStepResultStatus } from '@cucumber/messages'
import { doesHaveValue } from '../value_checker'
import type { IFormatterOptions } from './index'
import SummaryFormatter from './summary_formatter'

type IEnvelope = Envelope
type ITestStepFinished = TestStepFinished

const STATUS_CHARACTER_MAPPING: Map<TestStepResultStatus, string> = new Map([
  [TestStepResultStatus.AMBIGUOUS, 'A'],
  [TestStepResultStatus.FAILED, 'F'],
  [TestStepResultStatus.PASSED, '.'],
  [TestStepResultStatus.PENDING, 'P'],
  [TestStepResultStatus.SKIPPED, '-'],
  [TestStepResultStatus.UNDEFINED, 'U'],
])

/**
 * @deprecated the built-in `progress` formatter is now plugin-based and no longer uses this class; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export default class ProgressFormatter extends SummaryFormatter {
  public static readonly documentation: string = 'Prints one character per scenario.'

  constructor(options: IFormatterOptions) {
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.log('\n\n')
      } else if (doesHaveValue(envelope.testStepFinished)) {
        this.logProgress(envelope.testStepFinished)
      }
    })
    super(options)
  }

  logProgress({ testStepResult: { status } }: ITestStepFinished): void {
    const character = this.colorFns.forStatus(status)(STATUS_CHARACTER_MAPPING.get(status))
    this.log(character)
  }
}
