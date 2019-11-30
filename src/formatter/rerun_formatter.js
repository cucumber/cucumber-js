import _ from 'lodash'
import Formatter from './'
import path from 'path'
import { messages } from 'cucumber-messages'
import { getGherkinScenarioLocationMap } from './helpers/gherkin_document_parser'

const { Status } = messages.TestResult

const DEFAULT_SEPARATOR = '\n'

export default class RerunFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testRunFinished) {
        this.logFailedTestCases()
      }
    })
    this.separator = _.get(options, 'rerun.separator', DEFAULT_SEPARATOR)
  }

  logFailedTestCases() {
    const mapping = {}
    _.each(
      this.eventDataCollector.getTestCaseAttempts(),
      ({ gherkinDocument, pickle, result }) => {
        if (result.status !== Status.PASSED) {
          const relativeUri = path.relative(this.cwd, pickle.uri)
          const line = getGherkinScenarioLocationMap(gherkinDocument)[
            _.last(pickle.sourceIds)
          ].line
          if (!mapping[relativeUri]) {
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
