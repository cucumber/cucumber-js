import Formatter, { IFormatterOptions } from './'
import { getGherkinScenarioLocationMap } from './helpers/gherkin_document_parser'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../value_checker'
import * as messages from '@cucumber/messages'

const DEFAULT_SEPARATOR = '\n'

interface UriToLinesMap {
  [uri: string]: number[]
}

function isFailedAttempt(worstTestStepResult: messages.TestStepResult) {
  return worstTestStepResult.status !== messages.TestStepResultStatus.PASSED
}

export default class RerunFormatter extends Formatter {
  protected readonly separator: string
  public static readonly documentation: string =
    'Prints failing files with line numbers.'

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logFailedTestCases()
      }
    })
    const rerunOptions = valueOrDefault(options.parsedArgvOptions.rerun, {})
    this.separator = valueOrDefault(rerunOptions.separator, DEFAULT_SEPARATOR)
  }

  getFailureMap(): UriToLinesMap {
    const mapping: UriToLinesMap = {}
    this.eventDataCollector
      .getTestCaseAttempts()
      .forEach(
        ({ gherkinDocument, pickle, worstTestStepResult, willBeRetried }) => {
          if (isFailedAttempt(worstTestStepResult) && !willBeRetried) {
            const relativeUri = pickle.uri
            const line =
              getGherkinScenarioLocationMap(gherkinDocument)[
                pickle.astNodeIds[pickle.astNodeIds.length - 1]
              ].line
            if (doesNotHaveValue(mapping[relativeUri])) {
              mapping[relativeUri] = []
            }
            mapping[relativeUri].push(line)
          }
        }
      )

    return mapping
  }

  formatFailedTestCases(): string {
    const mapping = this.getFailureMap()

    return Object.keys(mapping)
      .map((uri) => {
        const lines = mapping[uri]
        return `${uri}:${lines.join(':')}`
      })
      .join(this.separator)
  }

  logFailedTestCases(): void {
    const failedTestCases = this.formatFailedTestCases()
    this.log(failedTestCases)
  }
}
