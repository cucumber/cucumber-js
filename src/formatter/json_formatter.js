import _ from 'lodash'
import Formatter from './'
import Status from '../status'
import { formatLocation, GherkinDocumentParser, PickleParser } from './helpers'
import { buildStepArgumentIterator } from '../step_arguments'
import { format } from 'assertion-error-formatter'

const {
  getStepLineToKeywordMap,
  getScenarioLineToDescriptionMap,
} = GherkinDocumentParser

const {
  getScenarioDescription,
  getStepLineToPickledStepMap,
  getStepKeyword,
} = PickleParser

export default class JsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.onTestRunFinished)
  }

  convertNameToId(obj) {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  formatDataTable(dataTable) {
    return {
      rows: dataTable.rows.map(row => ({ cells: _.map(row.cells, 'value') })),
    }
  }

  formatDocString(docString) {
    return {
      content: docString.content,
      line: docString.location.line,
    }
  }

  formatStepArguments(stepArguments) {
    const iterator = buildStepArgumentIterator({
      dataTable: this.formatDataTable.bind(this),
      docString: this.formatDocString.bind(this),
    })
    return _.map(stepArguments, iterator)
  }

  onTestRunFinished() {
    const groupedTestCaseAttempts = {}
    _.each(this.eventDataCollector.getTestCaseAttempts(), testCaseAttempt => {
      if (!testCaseAttempt.result.retried) {
        const { uri } = testCaseAttempt.testCase.sourceLocation
        if (!groupedTestCaseAttempts[uri]) {
          groupedTestCaseAttempts[uri] = []
        }
        groupedTestCaseAttempts[uri].push(testCaseAttempt)
      }
    })
    const features = _.map(groupedTestCaseAttempts, (group, uri) => {
      const gherkinDocument = this.eventDataCollector.gherkinDocumentMap[uri]
      const featureData = this.getFeatureData(gherkinDocument.feature, uri)
      const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocument)
      const scenarioLineToDescriptionMap = getScenarioLineToDescriptionMap(
        gherkinDocument
      )
      featureData.elements = group.map(testCaseAttempt => {
        const { pickle } = testCaseAttempt
        const scenarioData = this.getScenarioData({
          featureId: featureData.id,
          pickle,
          scenarioLineToDescriptionMap,
        })
        const stepLineToPickledStepMap = getStepLineToPickledStepMap(pickle)
        let isBeforeHook = true
        scenarioData.steps = testCaseAttempt.testCase.steps.map(
          (testStep, index) => {
            isBeforeHook = isBeforeHook && !testStep.sourceLocation
            return this.getStepData({
              isBeforeHook,
              stepLineToKeywordMap,
              stepLineToPickledStepMap,
              testStep,
              testStepAttachments: testCaseAttempt.stepAttachments[index],
              testStepResult: testCaseAttempt.stepResults[index],
            })
          }
        )
        return scenarioData
      })
      return featureData
    })
    this.log(JSON.stringify(features, null, 2))
  }

  getFeatureData(feature, uri) {
    return {
      description: feature.description,
      keyword: feature.keyword,
      name: feature.name,
      line: feature.location.line,
      id: this.convertNameToId(feature),
      tags: this.getTags(feature),
      uri,
    }
  }

  getScenarioData({ featureId, pickle, scenarioLineToDescriptionMap }) {
    const description = getScenarioDescription({
      pickle,
      scenarioLineToDescriptionMap,
    })
    return {
      description,
      id: `${featureId};${this.convertNameToId(pickle)}`,
      keyword: 'Scenario',
      line: pickle.locations[0].line,
      name: pickle.name,
      tags: this.getTags(pickle),
      type: 'scenario',
    }
  }

  getStepData({
    isBeforeHook,
    stepLineToKeywordMap,
    stepLineToPickledStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }) {
    const data = {}
    if (testStep.sourceLocation) {
      const { line } = testStep.sourceLocation
      const pickleStep = stepLineToPickledStepMap[line]
      data.arguments = this.formatStepArguments(pickleStep.arguments)
      data.keyword = getStepKeyword({ pickleStep, stepLineToKeywordMap })
      data.line = line
      data.name = pickleStep.text
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After'
      data.hidden = true
    }
    if (testStep.actionLocation) {
      data.match = { location: formatLocation(testStep.actionLocation) }
    }
    if (testStepResult) {
      const { exception, status } = testStepResult
      data.result = { status }
      if (!_.isUndefined(testStepResult.duration)) {
        data.result.duration = testStepResult.duration * 1000000
      }
      if (status === Status.FAILED && exception) {
        data.result.error_message = format(exception)
      }
    }
    if (_.size(testStepAttachments) > 0) {
      data.embeddings = testStepAttachments.map(attachment => ({
        data: attachment.data,
        mime_type: attachment.media.type,
      }))
    }
    return data
  }

  getTags(obj) {
    return _.map(obj.tags, tagData => ({
      name: tagData.name,
      line: tagData.location.line,
    }))
  }
}
