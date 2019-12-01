import _ from 'lodash'
import Formatter from './'
import Status from '../status'
import { formatLocation, GherkinDocumentParser, PickleParser } from './helpers'
import util from 'util'
import { durationToNanoseconds } from '../time'
import path from 'path'

const { getGherkinStepMap, getGherkinScenarioMap } = GherkinDocumentParser

const {
  getScenarioDescription,
  getPickleStepMap,
  getStepKeyword,
} = PickleParser

export default class JsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testRunFinished) {
        this.onTestRunFinished()
      }
    })
  }

  convertNameToId(obj) {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  formatDataTable(dataTable) {
    return {
      rows: dataTable.rows.map(row => ({ cells: _.map(row.cells, 'value') })),
    }
  }

  formatDocString(docString, gherkinStep) {
    return {
      content: docString.content,
      line: gherkinStep.docString.location.line,
    }
  }

  formatStepArgument(stepArgument, gherkinStep) {
    if (!stepArgument) {
      return []
    }
    if (stepArgument.docString) {
      return [this.formatDocString(stepArgument.docString, gherkinStep)]
    } else if (stepArgument.dataTable) {
      return [this.formatDataTable(stepArgument.dataTable)]
    }
    throw new Error(`Unknown argument type:${util.inspect(stepArgument)}`)
  }

  onTestRunFinished() {
    const groupedTestCaseAttempts = {}
    _.each(this.eventDataCollector.getTestCaseAttempts(), testCaseAttempt => {
      if (!testCaseAttempt.result.willBeRetried) {
        const uri = path.relative(this.cwd, testCaseAttempt.pickle.uri)
        if (!groupedTestCaseAttempts[uri]) {
          groupedTestCaseAttempts[uri] = []
        }
        groupedTestCaseAttempts[uri].push(testCaseAttempt)
      }
    })
    const features = _.map(groupedTestCaseAttempts, (group, uri) => {
      const { gherkinDocument } = group[0]
      const featureData = this.getFeatureData(gherkinDocument.feature, uri)
      const gherkinStepMap = getGherkinStepMap(gherkinDocument)
      const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)
      featureData.elements = group.map(testCaseAttempt => {
        const { pickle } = testCaseAttempt
        const scenarioData = this.getScenarioData({
          feature: gherkinDocument.feature,
          pickle,
          gherkinScenarioMap,
        })
        const pickleStepMap = getPickleStepMap(pickle)
        let isBeforeHook = true
        scenarioData.steps = testCaseAttempt.testCase.testSteps.map(
          testStep => {
            isBeforeHook = isBeforeHook && !testStep.pickleStepId
            return this.getStepData({
              isBeforeHook,
              gherkinStepMap,
              pickleStepMap,
              testStep,
              testStepAttachments: testCaseAttempt.stepAttachments[testStep.id],
              testStepResult: testCaseAttempt.stepResults[testStep.id],
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
      tags: this.getFeatureTags(feature),
      uri,
    }
  }

  getScenarioData({ feature, pickle, gherkinScenarioMap }) {
    const description = getScenarioDescription({
      pickle,
      gherkinScenarioMap,
    })
    return {
      description,
      id: `${this.convertNameToId(feature)};${this.convertNameToId(pickle)}`,
      keyword: 'Scenario',
      line: gherkinScenarioMap[pickle.sourceIds[0]].location.line,
      name: pickle.name,
      tags: this.getScenarioTags({ feature, pickle, gherkinScenarioMap }),
      type: 'scenario',
    }
  }

  getStepData({
    isBeforeHook,
    gherkinStepMap,
    pickleStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }) {
    const data = {}
    if (testStep.pickleStepId) {
      const pickleStep = pickleStepMap[testStep.pickleStepId]
      data.arguments = this.formatStepArgument(
        pickleStep.argument,
        gherkinStepMap[pickleStep.sourceIds[0]]
      )
      data.keyword = getStepKeyword({ pickleStep, gherkinStepMap })
      data.line = gherkinStepMap[pickleStep.sourceIds[0]].location.line
      data.name = pickleStep.text
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After'
      data.hidden = true
    }
    if (testStep.stepDefinitionId.length === 1) {
      const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
        s => s.id === testStep.stepDefinitionId[0]
      )
      data.match = { location: formatLocation(stepDefinition) }
    }
    if (testStepResult) {
      const { message, status } = testStepResult
      data.result = { status: Status[status].toLowerCase() }
      if (!_.isUndefined(testStepResult.duration)) {
        data.result.duration = durationToNanoseconds(testStepResult.duration)
      }
      if (status === Status.FAILED && message) {
        data.result.error_message = message
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

  getFeatureTags(feature) {
    return _.map(feature.tags, tagData => ({
      name: tagData.name,
      line: tagData.location.line,
    }))
  }

  getScenarioTags({ feature, pickle, gherkinScenarioMap }) {
    return _.map(pickle.tags, tagData => {
      const featureSource = feature.tags.find(t => t.id === tagData.sourceId)
      const scenarioSource = gherkinScenarioMap[pickle.sourceIds[0]].tags.find(
        t => t.id === tagData.sourceId
      )
      return {
        name: tagData.name,
        line: (featureSource || scenarioSource).location.line,
      }
    })
  }
}
