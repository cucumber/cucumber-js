import {
  type Attachment,
  AttachmentContentEncoding,
  type Envelope,
  type Feature,
  type Location,
  type Pickle,
  type PickleDocString,
  type PickleStep,
  type PickleStepArgument,
  type PickleTable,
  type PickleTag,
  type Rule,
  type Scenario,
  type Step,
  type Tag,
  type TestStep,
  type TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages'
import { parseStepArgument } from '../step_arguments'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import Formatter, { type IFormatterOptions } from './'
import { formatLocation, GherkinDocumentParser, PickleParser } from './helpers'
import { durationToNanoseconds } from './helpers/duration_helpers'
import type { ITestCaseAttempt } from './helpers/event_data_collector'
import {
  getGherkinExampleRuleMap,
  getGherkinScenarioLocationMap,
} from './helpers/gherkin_document_parser'

const { getGherkinStepMap, getGherkinScenarioMap } = GherkinDocumentParser

const { getScenarioDescription, getPickleStepMap, getStepKeyword } = PickleParser

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

export interface IJsonDataTable {
  rows: Array<{ cells: string[] }>
}

export interface IJsonDocString {
  content: string
  line: number
}

export type IJsonStepArgument = IJsonDataTable | IJsonDocString

export interface IJsonEmbedding {
  data: string
  mime_type: string
}

export interface IJsonStepMatch {
  location: string
}

export interface IJsonStepResult {
  status: string
  duration?: number
  error_message?: string
}

export interface IJsonStep {
  arguments?: IJsonStepArgument[]
  embeddings?: IJsonEmbedding[]
  hidden?: boolean
  keyword?: string // TODO, not optional
  line?: number
  match?: IJsonStepMatch
  name?: string
  result: IJsonStepResult
}

export interface IJsonTag {
  name: string
  line: number
}

interface IBuildJsonFeatureOptions {
  feature: Feature
  elements: IJsonScenario[]
  uri: string
}

interface IBuildJsonScenarioOptions {
  feature: Feature
  gherkinScenarioMap: Record<string, Scenario>
  gherkinExampleRuleMap: Record<string, Rule>
  gherkinScenarioLocationMap: Record<string, Location>
  pickle: Pickle
  steps: IJsonStep[]
}

interface IBuildJsonStepOptions {
  isBeforeHook: boolean
  gherkinStepMap: Record<string, Step>
  pickleStepMap: Record<string, PickleStep>
  testStep: TestStep
  testStepAttachments: Attachment[]
  testStepResult: TestStepResult
}

interface UriToTestCaseAttemptsMap {
  [uri: string]: ITestCaseAttempt[]
}

export default class JsonFormatter extends Formatter {
  public static readonly documentation: string =
    'Prints the feature as JSON. The JSON format is in maintenance mode. Please consider using the message formatter with the standalone json-formatter (https://github.com/cucumber/json-formatter).'

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.onTestRunFinished()
      }
    })
  }

  convertNameToId(obj: Feature | Rule | Pickle): string {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  formatDataTable(dataTable: PickleTable): IJsonDataTable {
    return {
      rows: dataTable.rows.map((row) => ({
        cells: row.cells.map((x) => x.value),
      })),
    }
  }

  formatDocString(docString: PickleDocString, gherkinStep: Step): IJsonDocString {
    return {
      content: docString.content,
      line: gherkinStep.docString.location.line,
    }
  }

  formatStepArgument(stepArgument: PickleStepArgument, gherkinStep: Step): IJsonStepArgument[] {
    if (doesNotHaveValue(stepArgument)) {
      return []
    }
    return [
      parseStepArgument<IJsonStepArgument>(stepArgument, {
        dataTable: (dataTable) => this.formatDataTable(dataTable),
        docString: (docString) => this.formatDocString(docString, gherkinStep),
      }),
    ]
  }

  onTestRunFinished(): void {
    const groupedTestCaseAttempts: UriToTestCaseAttemptsMap = {}
    this.eventDataCollector.getTestCaseAttempts().forEach((testCaseAttempt: ITestCaseAttempt) => {
      if (!testCaseAttempt.willBeRetried) {
        const uri = testCaseAttempt.pickle.uri
        if (doesNotHaveValue(groupedTestCaseAttempts[uri])) {
          groupedTestCaseAttempts[uri] = []
        }
        groupedTestCaseAttempts[uri].push(testCaseAttempt)
      }
    })
    const features = Object.keys(groupedTestCaseAttempts).map((uri) => {
      const group = groupedTestCaseAttempts[uri]
      const { gherkinDocument } = group[0]
      const gherkinStepMap = getGherkinStepMap(gherkinDocument)
      const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument)
      const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument)
      const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument)
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

  getFeatureData({ feature, elements, uri }: IBuildJsonFeatureOptions): IJsonFeature {
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
      line: gherkinScenarioLocationMap[pickle.astNodeIds[pickle.astNodeIds.length - 1]].line,
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
    feature: Feature
    pickle: Pickle
    gherkinExampleRuleMap: Record<string, Rule>
  }): string {
    let parts: Array<Feature | Rule | Pickle>
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
    const data: IJsonStep = {
      result: {
        status: TestStepResultStatus[testStepResult.status].toLowerCase(),
      },
    }
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
    if (doesHaveValue(testStep.stepDefinitionIds) && testStep.stepDefinitionIds.length === 1) {
      const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
        (s) => s.id === testStep.stepDefinitionIds[0]
      )
      data.match = { location: formatLocation(stepDefinition) }
    }
    const { message, status } = testStepResult
    if (doesHaveValue(testStepResult.duration)) {
      data.result.duration = durationToNanoseconds(testStepResult.duration)
    }
    if (status === TestStepResultStatus.FAILED && doesHaveValue(message)) {
      data.result.error_message = message
    }
    if (testStepAttachments?.length > 0) {
      data.embeddings = testStepAttachments.map((attachment) => ({
        data:
          attachment.contentEncoding === AttachmentContentEncoding.IDENTITY
            ? Buffer.from(attachment.body).toString('base64')
            : attachment.body,
        mime_type: attachment.mediaType,
      }))
    }
    return data
  }

  getFeatureTags(feature: Feature): IJsonTag[] {
    return feature.tags.map((tagData) => ({
      name: tagData.name,
      line: tagData.location.line,
    }))
  }

  getScenarioTags({
    feature,
    pickle,
    gherkinScenarioMap,
  }: {
    feature: Feature
    pickle: Pickle
    gherkinScenarioMap: Record<string, Scenario>
  }): IJsonTag[] {
    const scenario = gherkinScenarioMap[pickle.astNodeIds[0]]

    return pickle.tags.map(
      (tagData: PickleTag): IJsonTag => this.getScenarioTag(tagData, feature, scenario)
    )
  }

  private getScenarioTag(tagData: PickleTag, feature: Feature, scenario: Scenario): IJsonTag {
    const byAstNodeId = (tag: Tag): boolean => tag.id === tagData.astNodeId
    const flatten = (acc: Tag[], val: Tag[]): Tag[] => acc.concat(val)

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
