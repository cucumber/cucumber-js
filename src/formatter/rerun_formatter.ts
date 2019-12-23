import _ from 'lodash'
import Formatter from './'
import Status from '../status'
import path from 'path'
import { getGherkinScenarioLocationMap } from './helpers/gherkin_document_parser'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { messages } from 'cucumber-messages'

const DEFAULT_SEPARATOR = '\n'

interface UriToLinesMap {
  [uri: string]: number[]
}

export default class RerunFormatter extends Formatter {
  private readonly separator: string

  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logFailedTestCases()
      }
    })
    this.separator = _.get(options, 'rerun.separator', DEFAULT_SEPARATOR)
  }

  logFailedTestCases(): void {
    const mapping: UriToLinesMap = {}
    _.each(
      this.eventDataCollector.getTestCaseAttempts(),
      ({ gherkinDocument, pickle, result }) => {
        if (result.status !== Status.PASSED) {
          const relativeUri = path.relative(this.cwd, pickle.uri)
          const line = getGherkinScenarioLocationMap(gherkinDocument)[
            _.last(pickle.astNodeIds)
          ].line
          if (doesNotHaveValue(mapping[relativeUri])) {
            mapping[relativeUri] = []
          }
          mapping[relativeUri].push(line)
        }
      }
    )
    const text = _.chain(mapping)
      .map((lines, uri) => `${uri}:${lines.join(':')}`)
      .join(this.separator)
      .value()
    this.log(text)
  }
}
