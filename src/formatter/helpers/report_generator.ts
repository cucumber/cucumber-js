import * as messages from '@cucumber/messages'

type JsonTimestamp = messages.Timestamp
type JsonException = messages.Exception
type JsonStepType = messages.PickleStepType

type JsonResultUnknown = {
  status: 'UNKNOWN'
}
type JsonResultSkipped = {
  status: 'SKIPPED'
}
type JsonResultUndefined = {
  status: 'UNDEFINED'
}
type JsonResultAmbiguous = {
  status: 'AMBIGUOUS'
}
type JsonResultStarted = {
  status: 'STARTED'
  startTimestamp: JsonTimestamp
}
type JsonResultPending = {
  status: 'PENDING'
  startTimestamp: JsonTimestamp
  endTimestamp: JsonTimestamp
}
type JsonResultPassed = {
  status: 'PASSED'
  startTimestamp: JsonTimestamp
  endTimestamp: JsonTimestamp
}
type JsonResultFailed = {
  status: 'FAILED'
  startTimestamp: JsonTimestamp
  endTimestamp: JsonTimestamp
  message?: string
  exception?: JsonException
}

type JsonCommandResult = JsonResultPassed | JsonResultFailed
type JsonStepResult =
  | JsonResultUnknown
  | JsonResultSkipped
  | JsonResultUndefined
  | JsonResultAmbiguous
  | JsonResultStarted
  | JsonResultPending
  | JsonResultPassed
  | JsonResultFailed
type JsonTestResult =
  | JsonResultUnknown
  | JsonResultStarted
  | JsonResultPassed
  | JsonResultFailed
type JsonReportResult = JsonTestResult

type JsonCommand = {
  type: string
  text: string
  screenShotId?: string
  reasoning?: string
  description: string
  value: string
  result: JsonCommandResult
}

type JsonStep = {
  type: JsonStepType
  text: string
  commands: JsonCommand[]
  result: JsonStepResult
}

type JsonTestProgress = {
  id: string
  featureName: string
  uri: string
  scenarioName: string
  parameters: Record<string, string>
  steps: Record<string, JsonStep>
  result: JsonTestResult
}

type JsonReport = {
  testCaseMap: Record<string, JsonTestProgress>
  result: JsonReportResult
}

export default class ReportGenerator {
  private report: JsonReport = {
    result: {
      status: 'UNKNOWN',
    },
    testCaseMap: {},
  }
  private gherkinDocumentMap = new Map<string, messages.GherkinDocument>()
  private pickleMap = new Map<string, messages.Pickle>()
  private pickleStepMap = new Map<string, messages.PickleStep>()
  private testCaseMap = new Map<string, messages.TestCase>()
  private testStepMap = new Map<string, messages.TestStep>()

  handleMessage(envelope: messages.Envelope) {
    const type = Object.keys(envelope)[0] as keyof messages.Envelope
    switch (type) {
      // case "meta": { break}
      // case "source": { break}
      case 'parseError': {
        const parseError = envelope[type]
        // console.log(parseError)
        // TODO: handle parseError
        break
      }
      case 'gherkinDocument': {
        const doc = envelope[type]
        this.onGherkinDocument(doc)
        break
      }
      case 'pickle': {
        const pickle = envelope[type]
        this.onPickle(pickle)
        break
      }
      // case "stepDefinition": { break}
      // case "hook": { break} // Before Hook
      case 'testRunStarted': {
        const testRunStarted = envelope[type]
        this.onTestRunStarted(testRunStarted)
        break
      }
      case 'testCase': {
        const testCase = envelope[type]
        this.onTestCase(testCase)
        break
      }
      case 'testCaseStarted': {
        const testCaseStarted = envelope[type]
        this.onTestCaseStarted(testCaseStarted)
        break
      }
      case 'testStepStarted': {
        const testStepStarted = envelope[type]
        this.onTestStepStarted(testStepStarted)
        break
      }
      case 'attachment': {
        const attachment = envelope[type]
        this.onAttachment(attachment)
        break
      }
      case 'testStepFinished': {
        const testStepFinished = envelope[type]
        this.onTestStepFinished(testStepFinished)
        break
      }
      case 'testCaseFinished': {
        const testCaseFinished = envelope[type]
        this.onTestCaseFinished(testCaseFinished)
        break
      }
      // case "hook": { break} // After Hook
      case 'testRunFinished': {
        const testRunFinished = envelope[type]
        this.onTestRunFinished(testRunFinished)
        break
      }
      // case "parameterType" : { break}
      // case "undefinedParameterType": { break}
    }
  }
  getReport() {
    return this.report
  }
  private onGherkinDocument(doc: messages.GherkinDocument) {
    this.gherkinDocumentMap.set(doc.uri, doc)
  }
  private onPickle(pickle: messages.Pickle) {
    this.pickleMap.set(pickle.id, pickle)
    pickle.steps.forEach((step) => {
      this.pickleStepMap.set(step.id, step)
    })
  }
  private onTestRunStarted(testRunStarted: messages.TestRunStarted) {
    this.report.result = {
      status: 'STARTED',
      startTimestamp: testRunStarted.timestamp,
    }
  }
  private onTestCase(testCase: messages.TestCase) {
    this.testCaseMap.set(testCase.id, testCase)
    testCase.testSteps.forEach((testStep) => {
      this.testStepMap.set(testStep.id, testStep)
    })
  }
  private onTestCaseStarted(testCaseStarted: messages.TestCaseStarted) {
    const { testCaseId, id, timestamp } = testCaseStarted
    const testCase = this.testCaseMap.get(testCaseId)
    if (testCase === undefined)
      throw new Error(`testCase with id ${testCaseId} not found`)
    const pickle = this.pickleMap.get(testCase.pickleId)
    if (pickle === undefined)
      throw new Error(`pickle with id ${testCase.pickleId} not found`)

    const doc = this.gherkinDocumentMap.get(pickle.uri)
    if (doc === undefined)
      throw new Error(`gherkinDocument with uri ${pickle.uri} not found`)
    const featureName = doc.feature.name

    const scenarioName = pickle.name
    const steps = pickle.steps.reduce((s, step) => {
      s[step.id] = {
        type: step.type,
        text: step.text,
        commands: [],
        result: {
          status: 'UNKNOWN',
        },
      }
      return s
    }, {} as JsonTestProgress['steps'])

    this.report.testCaseMap[id] = {
      id,
      uri: pickle.uri,
      featureName,
      scenarioName,
      // TODO: compute parameters
      parameters: {},
      steps,
      result: {
        status: 'STARTED',
        startTimestamp: timestamp,
      },
    }
  }
  private onTestStepStarted(testStepStarted: messages.TestStepStarted) {
    const { testStepId, timestamp, testCaseStartedId } = testStepStarted
    const testStep = this.testStepMap.get(testStepId)
    if (testStep === undefined)
      throw new Error(`testStep with id ${testStepId} not found`)
    if (testStep.pickleStepId === undefined) return
    const pickleStep = this.pickleStepMap.get(testStep.pickleStepId)
    const stepProgess =
      this.report.testCaseMap[testCaseStartedId].steps[pickleStep.id]
    stepProgess.result = {
      status: 'STARTED',
      startTimestamp: timestamp,
    }
    this.report.testCaseMap[testCaseStartedId].steps[pickleStep.id] =
      stepProgess
  }
  private onAttachment(attachment: messages.Attachment) {
    const {
      testCaseStartedId,
      testStepId,
      body,
      mediaType,
      contentEncoding,
      fileName,
      source,
      url,
    } = attachment
    const testStep = this.testStepMap.get(testStepId)
    if (testStep.pickleStepId === undefined) return
    const pickleStep = this.pickleStepMap.get(testStep.pickleStepId)
    const stepProgess =
      this.report.testCaseMap[testCaseStartedId].steps[pickleStep.id]
    if (mediaType === 'application/json') {
      stepProgess.commands.push(JSON.parse(body) as JsonCommand)
    }
  }
  private onTestStepFinished(testStepFinished: messages.TestStepFinished) {
    const { testStepId, testCaseStartedId, testStepResult, timestamp } =
      testStepFinished
    const testStep = this.testStepMap.get(testStepId)
    if (testStep.pickleStepId === undefined) return
    const pickleStep = this.pickleStepMap.get(testStep.pickleStepId)
    const stepProgess =
      this.report.testCaseMap[testCaseStartedId].steps[pickleStep.id]
    const prevStepResult = stepProgess.result as {
      status: 'STARTED'
      startTimestamp: JsonTimestamp
    }
    stepProgess.result = {
      status: testStepResult.status,
      startTimestamp: prevStepResult.startTimestamp,
      endTimestamp: timestamp,
      message: testStepResult.message,
      exception: testStepResult.exception,
    }
  }
  private getTestCaseResult(steps: JsonStep[]) {
    for (const step of steps) {
      switch (step.result.status) {
        case 'FAILED':
          return {
            status: step.result.status,
            message: step.result.message,
            exception: step.result.exception,
          } as const
        case 'AMBIGUOUS':
        case 'UNDEFINED':
        case 'PENDING':
          return {
            status: 'FAILED',
            message: `step "${step.text}" is ${step.result.status}`,
          } as const
      }
    }
    return {
      status: 'PASSED',
    } as const
  }
  private onTestCaseFinished(testCaseFinished: messages.TestCaseFinished) {
    const { testCaseStartedId, timestamp } = testCaseFinished
    const testProgress = this.report.testCaseMap[testCaseStartedId]
    const prevResult = testProgress.result as {
      status: 'STARTED'
      startTimestamp: JsonTimestamp
    }
    const steps = Object.values(testProgress.steps)
    const result = this.getTestCaseResult(steps)
    testProgress.result = {
      ...result,
      startTimestamp: prevResult.startTimestamp,
      endTimestamp: timestamp,
    }
  }
  private onTestRunFinished(testRunFinished: messages.TestRunFinished) {
    const { timestamp, success, exception, message } = testRunFinished
    const prevResult = this.report.result as {
      status: 'STARTED'
      startTimestamp: JsonTimestamp
    }
    this.report.result = {
      status: success ? 'PASSED' : 'FAILED',
      startTimestamp: prevResult.startTimestamp,
      endTimestamp: timestamp,
      message,
      exception,
    }
  }
}
