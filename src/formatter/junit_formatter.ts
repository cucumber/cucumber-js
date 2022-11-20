import path from 'path'

import xmlbuilder from 'xmlbuilder'
import Formatter, { IFormatterOptions } from './'
import * as messages from '@cucumber/messages'
import {
  Attachment,
  Duration,
  getWorstTestStepResult,
  TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages'
import { ITestCaseAttempt } from './helpers/event_data_collector'
import { doesHaveValue } from '../value_checker'
import {
  getGherkinExampleRuleMap,
  getGherkinStepMap,
} from './helpers/gherkin_document_parser'
import { getPickleStepMap, getStepKeyword } from './helpers/pickle_parser'

interface IJUnitTestSuite {
  name: string
  failures: number
  time: number
  tests: IJUnitTestCase[]
}

interface IJUnitTestCase {
  id: string
  name: string
  time: number
  result: IJUnitTestCaseResult
  systemOutput: string
  steps: IJUnitTestStep[]
}

interface IJUnitTestCaseResult {
  status: TestStepResultStatus
  success: boolean
  message?: string
}

interface IJUnitTestStep {
  attachments: Attachment[]
  hidden: boolean
  keyword: string
  line: number
  name?: string
  location?: string
  result: TestStepResult
  time: number
}

interface IBuildJUnitTestStepOptions {
  isBeforeHook: boolean
  gherkinStepMap: Record<string, messages.Step>
  pickleStepMap: Record<string, messages.PickleStep>
  testStep: messages.TestStep
  testStepAttachments: messages.Attachment[]
  testStepResult: messages.TestStepResult
}

interface ILineAndUri {
  line: number
  uri: string
}

const statusDescriptions: Record<TestStepResultStatus, string> = {
  UNKNOWN: `A result couldn't be established`,
  PASSED: 'Everything went fine',
  SKIPPED: 'The test case was skipped',
  PENDING: 'A step in the test case is not yet implemented',
  UNDEFINED: 'A step in the test case is not defined',
  AMBIGUOUS: 'Multiple definitions match one of the steps in the test case',
  FAILED: 'A hook or step failed',
}

export default class JunitFormatter extends Formatter {
  public static readonly documentation: string = 'Outputs JUnit report'

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.onTestRunFinished()
      }
    })
  }

  private getTestCases() {
    return this.eventDataCollector
      .getTestCaseAttempts()
      .filter((attempt) => !attempt.willBeRetried)
  }

  private getTestSteps(
    testCaseAttempt: ITestCaseAttempt,
    gherkinStepMap: Record<string, messages.Step>,
    pickleStepMap: Record<string, messages.PickleStep>
  ) {
    return testCaseAttempt.testCase.testSteps.map((testStep) => {
      const isBeforeHook = !doesHaveValue(testStep.pickleStepId)
      return this.getTestStep({
        isBeforeHook,
        gherkinStepMap,
        pickleStepMap,
        testStep,
        testStepAttachments: testCaseAttempt.stepAttachments[testStep.id],
        testStepResult: testCaseAttempt.stepResults[testStep.id],
      })
    })
  }

  private getTestStep({
    isBeforeHook,
    gherkinStepMap,
    pickleStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }: IBuildJUnitTestStepOptions): IJUnitTestStep {
    const data: Partial<IJUnitTestStep> = {}
    if (testStep.pickleStepId) {
      const pickleStep = pickleStepMap[testStep.pickleStepId]
      data.keyword = getStepKeyword({ pickleStep, gherkinStepMap })
      data.line = gherkinStepMap[pickleStep.astNodeIds[0]].location.line
      data.name = pickleStep.text
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After'
      data.hidden = true
    }
    if (testStep.stepDefinitionIds && testStep.stepDefinitionIds.length === 1) {
      const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
        (s) => s.id === testStep.stepDefinitionIds[0]
      )
      data.location = this.formatLocation(stepDefinition)
    }
    data.result = testStepResult
    data.time = testStepResult.duration
      ? this.durationToSeconds(testStepResult.duration)
      : 0
    data.attachments = testStepAttachments
    return data as IJUnitTestStep
  }

  private getTestcaseResult(steps: IJUnitTestStep[]): IJUnitTestCaseResult {
    const worstResult = getWorstTestStepResult(steps.map((step) => step.result))
    return {
      status: worstResult.status,
      success: worstResult.status === TestStepResultStatus.PASSED,
      message: worstResult.message,
    }
  }

  private convertNameToId(
    obj: messages.Feature | messages.Pickle | messages.Rule
  ): string {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  private durationToSeconds(duration: Duration): number {
    const NANOS_IN_SECOND = 1_000_000_000
    return (
      (duration.seconds * NANOS_IN_SECOND + duration.nanos) / NANOS_IN_SECOND
    )
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
    let parts: (messages.Feature | messages.Pickle | messages.Rule)[]
    const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]]
    if (doesHaveValue(rule)) {
      parts = [feature, rule, pickle]
    } else {
      parts = [feature, pickle]
    }
    return parts.map((part) => this.convertNameToId(part)).join(';')
  }

  formatLocation(obj: ILineAndUri, cwd?: string): string {
    let { uri } = obj
    if (cwd) {
      uri = path.relative(cwd, uri)
    }
    return `${uri}:${obj.line.toString()}`
  }

  formatTestSteps(steps: IJUnitTestStep[]): string {
    return steps
      .filter((step) => !step.hidden)
      .map((step) => {
        const statusText = step.result.status.toLowerCase()
        const maxLength = 80 - statusText.length - 3
        const stepText = `${step.keyword}${step.name}`
          .padEnd(maxLength, '.')
          .substring(0, maxLength)
        return `${stepText}...${statusText}`
      })
      .join('\n')
  }

  onTestRunFinished(): void {
    const testCases = this.getTestCases()

    const tests = testCases.map<IJUnitTestCase>(
      (testCaseAttempt: ITestCaseAttempt) => {
        const { gherkinDocument, pickle } = testCaseAttempt
        const { feature } = gherkinDocument
        const gherkinStepMap = getGherkinStepMap(gherkinDocument)
        const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument)
        const pickleStepMap = getPickleStepMap(pickle)

        const steps = this.getTestSteps(
          testCaseAttempt,
          gherkinStepMap,
          pickleStepMap
        )
        const stepDuration = steps.reduce(
          (total, step) => total + (step.time || 0),
          0
        )

        return {
          id: this.formatScenarioId({
            feature,
            pickle,
            gherkinExampleRuleMap,
          }),
          name: pickle.name,
          time: stepDuration,
          result: this.getTestcaseResult(steps),
          systemOutput: this.formatTestSteps(steps),
          steps,
        }
      }
    )

    const testSuite: IJUnitTestSuite = {
      name: 'cucumber-js',
      tests,
      failures: tests.filter((test) => !test.result.success).length,
      time: tests.reduce((total, test) => total + test.time, 0),
    }

    this.log(this.buildXmlReport(testSuite))
  }

  buildXmlReport(testSuite: IJUnitTestSuite): string {
    const xmlReport = xmlbuilder
      .create('testsuite')
      .att('failures', testSuite.failures)
      .att('name', testSuite.name)
      .att('time', testSuite.time)
      .att('tests', testSuite.tests.length)
    testSuite.tests.forEach((test) => {
      const xmlTestCase = xmlReport.ele('testcase', {
        name: test.name,
        time: test.time,
        classname: test.id,
      })
      if (!test.result.success) {
        const failureElement = xmlTestCase.ele('failure', {
          type: test.result.status,
          message: statusDescriptions[test.result.status],
        })
        if (test.result.message) {
          failureElement.cdata(test.result.message)
        }
      }
      xmlTestCase.ele('system-out', {}).cdata(test.systemOutput)
    })

    return xmlReport.end({ pretty: true })
  }
}
