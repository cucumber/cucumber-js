import xmlbuilder from 'xmlbuilder'
import Formatter, { IFormatterOptions } from './'
import * as messages from '@cucumber/messages'
import {
  Attachment,
  Duration,
  Feature,
  getWorstTestStepResult,
  Pickle,
  Rule,
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
import { valueOrDefault } from '../value_checker'

interface IJUnitTestSuite {
  name: string
  failures: number
  skipped: number
  time: number
  tests: IJUnitTestCase[]
}

interface IJUnitTestCase {
  classname: string
  name: string
  time: number
  result: IJUnitTestCaseResult
  systemOutput: string
  steps: IJUnitTestStep[]
}

interface IJUnitTestCaseFailure {
  type: string
  message?: string
  detail: string
}

interface IJUnitTestCaseResult {
  status: TestStepResultStatus
  failure?: IJUnitTestCaseFailure
}

interface IJUnitTestStep {
  attachments: Attachment[]
  hidden: boolean
  keyword: string
  line: number
  name?: string
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

export default class JunitFormatter extends Formatter {
  private readonly names: Record<string, string[]> = {}
  private readonly suiteName: string
  public static readonly documentation: string = 'Outputs JUnit report'

  constructor(options: IFormatterOptions) {
    super(options)
    this.suiteName = valueOrDefault(
      options.parsedArgvOptions.junit?.suiteName,
      'cucumber-js'
    )
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
    data.result = testStepResult
    data.time = testStepResult.duration
      ? this.durationToSeconds(testStepResult.duration)
      : 0
    data.attachments = testStepAttachments
    return data as IJUnitTestStep
  }

  private getTestCaseResult(steps: IJUnitTestStep[]): IJUnitTestCaseResult {
    const { status, message, exception } = getWorstTestStepResult(
      steps.map((step) => step.result)
    )
    return {
      status,
      failure:
        message || exception
          ? {
              type: exception?.type,
              message: exception?.message,
              detail: message,
            }
          : undefined,
    }
  }

  private durationToSeconds(duration: Duration): number {
    const NANOS_IN_SECOND = 1_000_000_000
    return (
      (duration.seconds * NANOS_IN_SECOND + duration.nanos) / NANOS_IN_SECOND
    )
  }

  private nameOrDefault(name: string, fallbackSuffix: string): string {
    if (!name) {
      return `(unnamed ${fallbackSuffix})`
    }
    return name
  }

  private getTestCaseName(
    feature: Feature,
    rule: Rule | undefined,
    pickle: Pickle
  ) {
    const featureName = this.nameOrDefault(feature.name, 'feature')
    const pickleName = this.nameOrDefault(pickle.name, 'scenario')
    const testCaseName = rule
      ? this.nameOrDefault(rule.name, 'rule') + ': ' + pickleName
      : pickleName
    if (!this.names[featureName]) {
      this.names[featureName] = []
    }
    let index = 0
    while (
      this.names[featureName].includes(
        index > 0 ? `${testCaseName} [${index}]` : testCaseName
      )
    ) {
      index++
    }
    const name = index > 0 ? `${testCaseName} [${index}]` : testCaseName
    this.names[featureName].push(name)
    return name
  }

  private formatTestSteps(steps: IJUnitTestStep[]): string {
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

  private onTestRunFinished(): void {
    const testCases = this.getTestCases()

    const tests = testCases.map<IJUnitTestCase>(
      (testCaseAttempt: ITestCaseAttempt) => {
        const { gherkinDocument, pickle } = testCaseAttempt
        const { feature } = gherkinDocument
        const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument)
        const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]]
        const gherkinStepMap = getGherkinStepMap(gherkinDocument)
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
          classname: this.nameOrDefault(feature.name, 'feature'),
          name: this.getTestCaseName(feature, rule, pickle),
          time: stepDuration,
          result: this.getTestCaseResult(steps),
          systemOutput: this.formatTestSteps(steps),
          steps,
        }
      }
    )

    const passed = tests.filter(
      (item) => item.result.status === TestStepResultStatus.PASSED
    ).length
    const skipped = tests.filter(
      (item) => item.result.status === TestStepResultStatus.SKIPPED
    ).length
    const failures = tests.length - passed - skipped

    const testSuite: IJUnitTestSuite = {
      name: this.suiteName,
      tests,
      failures,
      skipped,
      time: tests.reduce((total, test) => total + test.time, 0),
    }

    this.log(this.buildXmlReport(testSuite))
  }

  private buildXmlReport(testSuite: IJUnitTestSuite): string {
    const xmlReport = xmlbuilder
      .create('testsuite', { invalidCharReplacement: '' })
      .att('failures', testSuite.failures)
      .att('skipped', testSuite.skipped)
      .att('name', testSuite.name)
      .att('time', testSuite.time)
      .att('tests', testSuite.tests.length)
    testSuite.tests.forEach((test) => {
      const xmlTestCase = xmlReport.ele('testcase', {
        classname: test.classname,
        name: test.name,
        time: test.time,
      })
      if (test.result.status === TestStepResultStatus.SKIPPED) {
        xmlTestCase.ele('skipped')
      } else if (test.result.status !== TestStepResultStatus.PASSED) {
        const xmlFailure = xmlTestCase.ele('failure', {
          type: test.result.failure?.type,
          message: test.result.failure?.message,
        })
        if (test.result?.failure) {
          xmlFailure.cdata(test.result.failure.detail)
        }
      }
      xmlTestCase.ele('system-out', {}).cdata(test.systemOutput)
    })

    return xmlReport.end({ pretty: true })
  }
}
