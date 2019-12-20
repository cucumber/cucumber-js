import _ from 'lodash'
import Formatter from './'
import Status from '../status'
import { formatLocation, GherkinDocumentParser, PickleParser } from './helpers'
import util from 'util'
import { durationToNanoseconds } from '../time'
import path from 'path'
import { messages } from 'cucumber-messages'
import {
  IGherkinScenarioMap,
  IGherkinScenarioLocationMap,
  getGherkinScenarioLocationMap,
} from './helpers/gherkin_document_parser'
import { ITestCaseAttempt } from './helpers/event_data_collector'

const { getGherkinStepMap, getGherkinScenarioMap } = GherkinDocumentParser

const {
  getScenarioDescription,
  getPickleStepMap,
  getStepKeyword,
} = PickleParser

export interface IJsonFeature {
  description: string
  elements: IJsonScenario[]
  id: string
  keyword: string
  line: number
  name: string
  tags: IJsonTag[]
  uri: string
}

export interface IJsonScenario {
  description: string
  id: string
  keyword: string
  line: number
  name: string
  steps: IJsonStep[]
  tags: IJsonTag[]
  type: string
}

export interface IJsonStep {
  arguments?: any // TODO
  embeddings?: any // TODO
  hidden?: boolean
  keyword?: string // TODO, not optional
  line?: number
  match?: any // TODO
  name?: string
  result?: any // TODO
}

export interface IJsonTag {
  name: string
  line: number
}

interface IBuildJsonFeatureOptions {
  feature: messages.GherkinDocument.IFeature
  elements: IJsonScenario[]
  uri: string
}

interface IBuildJsonScenarioOptions {
  feature: messages.GherkinDocument.IFeature
  gherkinScenarioMap: IGherkinScenarioMap
  gherkinScenarioLocationMap: IGherkinScenarioLocationMap
  pickle: messages.IPickle
  steps: IJsonStep[]
}

interface UriToTestCaseAttemptsMap {
  [uri: string]: ITestCaseAttempt[]
}

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
    const groupedTestCaseAttempts: UriToTestCaseAttemptsMap = {}
    _.each(
      this.eventDataCollector.getTestCaseAttempts(),
      (testCaseAttempt: ITestCaseAttempt) => {
        if (!testCaseAttempt.result.willBeRetried) {
          const uri = path.relative(this.cwd, testCaseAttempt.pickle.uri)
          if (!groupedTestCaseAttempts[uri]) {
            groupedTestCaseAttempts[uri] = []
          }
          groupedTestCaseAttempts[uri].push(testCaseAttempt)
        }
      }
    )
    const features = _.map(groupedTestCaseAttempts, (group, uri) => {
      const { gherkinDocument } = group[0]
      const gherkinStepMap = getGherkinStepMap(gherkinDocument)
      const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)
      const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
        gherkinDocument
      )
      const elements = group.map((testCaseAttempt: ITestCaseAttempt) => {
        const { pickle } = testCaseAttempt
        const pickleStepMap = getPickleStepMap(pickle)
        let isBeforeHook = true
        const steps = testCaseAttempt.testCase.testSteps.map(testStep => {
          isBeforeHook = isBeforeHook && !testStep.pickleStepId
          return this.getStepData({
            isBeforeHook,
            gherkinStepMap,
            pickleStepMap,
            testStep,
            testStepAttachments: testCaseAttempt.stepAttachments[testStep.id],
            testStepResult: testCaseAttempt.stepResults[testStep.id],
          })
        })
        return this.getScenarioData({
          feature: gherkinDocument.feature,
          gherkinScenarioLocationMap,
          gherkinScenarioMap,
          pickle,
          steps,
        })
      })
      return this.getFeatureData({
        feature: gherkinDocument.feature,
        elements,
        uri,
      })
    })
    this.log(JSON.stringify(features, null, 2))
  }

  getFeatureData({
    feature,
    elements,
    uri,
  }: IBuildJsonFeatureOptions): IJsonFeature {
    return {
      description: feature.description,
      elements,
      id: this.convertNameToId(feature),
      line: feature.location.line,
      keyword: feature.keyword,
      name: feature.name,
      tags: this.getFeatureTags(feature),
      uri,
    }
  }

  getScenarioData({
    feature,
    gherkinScenarioLocationMap,
    gherkinScenarioMap,
    pickle,
    steps,
  }: IBuildJsonScenarioOptions): IJsonScenario {
    const description = getScenarioDescription({
      pickle,
      gherkinScenarioMap,
    })
    return {
      description,
      id: `${this.convertNameToId(feature)};${this.convertNameToId(pickle)}`,
      keyword: 'Scenario',
      line: gherkinScenarioLocationMap[pickle.astNodeIds[0]].line,
      name: pickle.name,
      steps,
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
  }): IJsonStep {
    const data: IJsonStep = {}
    if (testStep.pickleStepId) {
      const pickleStep = pickleStepMap[testStep.pickleStepId]
      data.arguments = this.formatStepArgument(
        pickleStep.argument,
        gherkinStepMap[pickleStep.astNodeIds[0]]
      )
      data.keyword = getStepKeyword({ pickleStep, gherkinStepMap })
      data.line = gherkinStepMap[pickleStep.astNodeIds[0]].location.line
      data.name = pickleStep.text
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After'
      data.hidden = true
    }
    if (testStep.stepDefinitionIds.length === 1) {
      const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
        s => s.id === testStep.stepDefinitionIds[0]
      )
      data.match = { location: formatLocation(stepDefinition) }
    }
    if (testStepResult) {
      const { message, status } = testStepResult
      data.result = { status: Status[status].toLowerCase() }
      if (testStepResult.duration) {
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
      const featureSource = feature.tags.find(t => t.id === tagData.astNodeId)
      const scenarioSource = gherkinScenarioMap[pickle.astNodeIds[0]].tags.find(
        t => t.id === tagData.astNodeId
      )
      return {
        name: tagData.name,
        line: (featureSource || scenarioSource).location.line,
      }
    })
  }
}
