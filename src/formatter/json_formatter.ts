import _ from 'lodash'
import Formatter, { IFormatterOptions } from './'
import { formatLocation, GherkinDocumentParser, PickleParser } from './helpers'
import path from 'path'
import * as messages from '@cucumber/messages'
import {
  getGherkinExampleRuleMap,
  getGherkinScenarioLocationMap,
} from './helpers/gherkin_document_parser'
import { ITestCaseAttempt } from './helpers/event_data_collector'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { parseStepArgument } from '../step_arguments'

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
  feature: messages.Feature
  elements: IJsonScenario[]
  uri: string
}

interface IBuildJsonScenarioOptions {
  feature: messages.Feature
  gherkinScenarioMap: Record<string, messages.Scenario>
  gherkinExampleRuleMap: Record<string, messages.Rule>
  gherkinScenarioLocationMap: Record<string, messages.Location>
  pickle: messages.Pickle
  steps: IJsonStep[]
}

interface IBuildJsonStepOptions {
  isBeforeHook: boolean
  gherkinStepMap: Record<string, messages.Step>
  pickleStepMap: Record<string, messages.PickleStep>
  testStep: messages.TestStep
  testStepAttachments: messages.Attachment[]
  testStepResult: messages.TestStepResult
}

interface UriToTestCaseAttemptsMap {
  [uri: string]: ITestCaseAttempt[]
}

export default class JsonFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.onTestRunFinished()
      }
    })
  }

  convertNameToId(obj: messages.Feature | messages.Pickle): string {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  formatDataTable(dataTable: messages.PickleTable): any {
    return {
      rows: dataTable.rows.map((row) => ({ cells: _.map(row.cells, 'value') })),
    }
  }

  formatDocString(
    docString: messages.PickleDocString,
    gherkinStep: messages.Step
  ): any {
    return {
      content: docString.content,
      line: gherkinStep.docString.location.line,
    }
  }

  formatStepArgument(
    stepArgument: messages.PickleStepArgument,
    gherkinStep: messages.Step
  ): any {
    if (doesNotHaveValue(stepArgument)) {
      return []
    }
    return [
      parseStepArgument<any>(stepArgument, {
        dataTable: (dataTable) => this.formatDataTable(dataTable),
        docString: (docString) => this.formatDocString(docString, gherkinStep),
      }),
    ]
  }

  onTestRunFinished(): void {
    const groupedTestCaseAttempts: UriToTestCaseAttemptsMap = {}
    _.each(
      this.eventDataCollector.getTestCaseAttempts(),
      (testCaseAttempt: ITestCaseAttempt) => {
        if (!testCaseAttempt.worstTestStepResult.willBeRetried) {
          const uri = path.relative(this.cwd, testCaseAttempt.pickle.uri)
          if (doesNotHaveValue(groupedTestCaseAttempts[uri])) {
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
      const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument)
      const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
        gherkinDocument
      )
      const elements = group.map((testCaseAttempt: ITestCaseAttempt) => {
        const { pickle } = testCaseAttempt
        const pickleStepMap = getPickleStepMap(pickle)
        let isBeforeHook = true
        const steps = testCaseAttempt.testCase.testSteps.map((testStep) => {
          isBeforeHook = isBeforeHook && !doesHaveValue(testStep.pickleStepId)
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
          gherkinExampleRuleMap,
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
    gherkinExampleRuleMap,
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
      id: this.formatScenarioId({ feature, pickle, gherkinExampleRuleMap }),
      keyword: gherkinScenarioMap[pickle.astNodeIds[0]].keyword,
      line: gherkinScenarioLocationMap[pickle.astNodeIds[0]].line,
      name: pickle.name,
      steps,
      tags: this.getScenarioTags({ feature, pickle, gherkinScenarioMap }),
      type: 'scenario',
    }
  }

  private formatScenarioId({
    feature,
    pickle,
    gherkinExampleRuleMap,
  }: {
    feature: messages.Feature
    pickle: messages.Pickle
    gherkinExampleRuleMap: Record<string, messages.Rule>
  }): string {
    let parts: any[]
    const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]]
    if (doesHaveValue(rule)) {
      parts = [feature, rule, pickle]
    } else {
      parts = [feature, pickle]
    }
    return parts.map((part) => this.convertNameToId(part)).join(';')
  }

  getStepData({
    isBeforeHook,
    gherkinStepMap,
    pickleStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }: IBuildJsonStepOptions): IJsonStep {
    const data: IJsonStep = {}
    if (doesHaveValue(testStep.pickleStepId)) {
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
    if (
      doesHaveValue(testStep.stepDefinitionIds) &&
      testStep.stepDefinitionIds.length === 1
    ) {
      const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
        (s) => s.id === testStep.stepDefinitionIds[0]
      )
      data.match = { location: formatLocation(stepDefinition) }
    }
    const { message, status } = testStepResult
    data.result = {
      status: messages.TestStepResultStatus[status].toLowerCase(),
    }
    if (doesHaveValue(testStepResult.duration)) {
      data.result.duration =
        messages.TimeConversion.durationToMilliseconds(
          testStepResult.duration
        ) * 1000000
    }
    if (
      status === messages.TestStepResultStatus.FAILED &&
      doesHaveValue(message)
    ) {
      data.result.error_message = message
    }
    if (_.size(testStepAttachments) > 0) {
      data.embeddings = testStepAttachments.map((attachment) => ({
        data: attachment.body,
        mime_type: attachment.mediaType,
      }))
    }
    return data
  }

  getFeatureTags(feature: messages.Feature): IJsonTag[] {
    return _.map(feature.tags, (tagData) => ({
      name: tagData.name,
      line: tagData.location.line,
    }))
  }

  getScenarioTags({
    feature,
    pickle,
    gherkinScenarioMap,
  }: {
    feature: messages.Feature
    pickle: messages.Pickle
    gherkinScenarioMap: Record<string, messages.Scenario>
  }): IJsonTag[] {
    const scenario = gherkinScenarioMap[pickle.astNodeIds[0]]

    return pickle.tags.map(
      (tagData: messages.PickleTag): IJsonTag =>
        this.getScenarioTag(tagData, feature, scenario)
    )
  }

  private getScenarioTag(
    tagData: messages.PickleTag,
    feature: messages.Feature,
    scenario: messages.Scenario
  ): IJsonTag {
    const byAstNodeId = (tag: messages.Tag): Boolean =>
      tag.id === tagData.astNodeId
    const flatten = (
      acc: messages.Tag[],
      val: messages.Tag[]
    ): messages.Tag[] => acc.concat(val)

    const tag =
      feature.tags.find(byAstNodeId) ||
      scenario.tags.find(byAstNodeId) ||
      scenario.examples
        .map((e) => e.tags)
        .reduce(flatten, [])
        .find(byAstNodeId)

    return {
      name: tagData.name,
      line: tag?.location?.line,
    }
  }
}
