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

export default class RerunFormatter extends Formatter {
  private readonly separator: string
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

  logFailedTestCases(): void {
    const mapping: UriToLinesMap = {}
    this.eventDataCollector
      .getTestCaseAttempts()
      .forEach(({ gherkinDocument, pickle, worstTestStepResult }) => {
        if (
          worstTestStepResult.status !== messages.TestStepResultStatus.PASSED
        ) {
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
      })
    const text = Object.keys(mapping)
      .map((uri) => {
        const lines = mapping[uri]
        return `${uri}:${lines.join(':')}`
      })
      .join(this.separator)
    this.log(text)
  }
}
