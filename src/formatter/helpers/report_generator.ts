import * as messages from '@cucumber/messages'
import fs from 'fs'
import path from 'path'
import { RunUploadService } from './upload_serivce'
// type JsonException = messages.Exception
type JsonTimestamp = number //messages.Timestamp
type JsonStepType = 'Unknown' | 'Context' | 'Action' | 'Outcome' | 'Conjunction'

const URL =
  process.env.NODE_ENV_BLINQ === 'dev'
    ? 'https://dev.api.blinq.io/api/runs'
    : process.env.NODE_ENV_BLINQ === 'local'
    ? 'http://localhost:5001/api/runs'
    : process.env.NODE_ENV_BLINQ === 'stage'
    ? 'https://stage.api.blinq.io/api/runs'
    : 'https://api.blinq.io/api/runs'

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL ?? URL
const BATCH_SIZE = 10
const MAX_RETRIES = 3
const REPORT_SERVICE_TOKEN =
  process.env.TOKEN ?? process.env.REPORT_SERVICE_TOKEN
export type JsonResultUnknown = {
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
export type JsonResultStarted = {
  status: 'STARTED'
  startTime: JsonTimestamp
}
type JsonResultPending = {
  status: 'PENDING'
  startTime: JsonTimestamp
  endTime: JsonTimestamp
}
export type JsonResultPassed = {
  status: 'PASSED'
  startTime: JsonTimestamp
  endTime: JsonTimestamp
}
export type JsonResultFailed = {
  status: 'FAILED'
  startTime: JsonTimestamp
  endTime: JsonTimestamp
  message?: string
  // exception?: JsonException
}
export type JsonFixedByAi = {
  status: 'FIXED_BY_AI'
  startTime: JsonTimestamp
  endTime: JsonTimestamp
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
  | JsonFixedByAi
export type JsonTestResult =
  | JsonResultUnknown
  | JsonResultStarted
  | JsonResultPassed
  | JsonResultFailed
  | JsonFixedByAi
type JsonReportResult = JsonTestResult

type JsonCommand = {
  type: string
  value?: string
  text: string
  screenshotId?: string
  result: JsonCommandResult
  netWorkLog?: any[]
}
type webLog = {
  type: string
  text: string
  location: string
  time: string
}
export type JsonStep = {
  keyword: string
  type: JsonStepType
  text: string
  commands: JsonCommand[]
  result: JsonStepResult
  webLog: webLog[]
  data?: any
}
export type RetrainStats = {
  result: JsonTestResult
  totalSteps: number
  upload_id: string
  local_id: number
}
export type JsonTestProgress = {
  id: string
  featureName: string
  uri: string
  scenarioName: string
  parameters: Record<string, string>
  steps: JsonStep[]
  result: JsonTestResult
  retrainStats?: RetrainStats
  webLog: any
  networkLog: any
  env: {
    name: string
    baseUrl: string
  }
}

export type JsonReport = {
  testCases: JsonTestProgress[]
  result: JsonReportResult
  env: {
    name: string
    baseUrl: string
  }
}

interface MetaMessage extends messages.Meta {
  runName: string
}
interface EnvelopeWithMetaMessage extends messages.Envelope {
  meta: MetaMessage
}
export default class ReportGenerator {
  private report: JsonReport = {
    result: {
      status: 'UNKNOWN',
    },
    testCases: [] as JsonTestProgress[],
    env: {
      name: '',
      baseUrl: '',
    },
  }
  private gherkinDocumentMap = new Map<string, messages.GherkinDocument>()
  private stepMap = new Map<string, messages.Step>()
  private pickleMap = new Map<string, messages.Pickle>()
  private testCaseMap = new Map<string, messages.TestCase>()
  private testStepMap = new Map<string, messages.TestStep>()
  private stepReportMap = new Map<string, JsonStep>()
  private testCaseReportMap = new Map<string, JsonTestProgress>()
  private scenarioIterationCountMap = new Map<string, number>()
  private logs: webLog[] = []
  private networkLog: any[] = []
  private stepLogs: webLog[] = []
  private runName = ''
  reportFolder: null | string = null
  private uploadService = new RunUploadService(
    REPORT_SERVICE_URL,
    REPORT_SERVICE_TOKEN
  )

  async handleMessage(envelope: EnvelopeWithMetaMessage) {
    if (envelope.meta && envelope.meta.runName) {
      this.runName = envelope.meta.runName
    }
    const type = Object.keys(envelope)[0] as keyof messages.Envelope
    switch (type) {
      // case "meta": { break}
      // case "source": { break}
      case 'parseError': {
        const parseError = envelope[type]
        this.handleParseError(parseError)
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
        await this.onTestCaseFinished(testCaseFinished)
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
  private handleParseError(parseError: messages.ParseError) {
    const { message } = parseError
    const timestamp = new Date().getTime()
    this.report.result = {
      status: 'FAILED',
      startTime: timestamp,
      endTime: timestamp,
      message: message,
    }
  }

  private onGherkinDocument(doc: messages.GherkinDocument) {
    this.gherkinDocumentMap.set(doc.uri, doc)
    doc.feature.children.forEach((child) => {
      if (child.scenario) {
        child.scenario.steps.forEach((step) => {
          this.stepMap.set(step.id, step)
        })
      } else if (child.background) {
        child.background.steps.forEach((step) => {
          this.stepMap.set(step.id, step)
        })
      } else if (child.rule) {
        child.rule.children.forEach((child) => {
          if (child.scenario) {
            child.scenario.steps.forEach((step) => {
              this.stepMap.set(step.id, step)
            })
          } else if (child.background) {
            child.background.steps.forEach((step) => {
              this.stepMap.set(step.id, step)
            })
          }
        })
      }
    })
  }
  private onPickle(pickle: messages.Pickle) {
    this.pickleMap.set(pickle.id, pickle)
  }
  private getTimeStamp(timestamp: messages.Timestamp) {
    return timestamp.seconds * 1000 + timestamp.nanos / 1000000
  }
  private onTestRunStarted(testRunStarted: messages.TestRunStarted) {
    this.report.result = {
      status: 'STARTED',
      startTime: this.getTimeStamp(testRunStarted.timestamp),
    }
  }
  private onTestCase(testCase: messages.TestCase) {
    this.testCaseMap.set(testCase.id, testCase)
    testCase.testSteps.forEach((testStep) => {
      this.testStepMap.set(testStep.id, testStep)
    })
  }
  private _findScenario(doc: messages.GherkinDocument, scenarioId: string) {
    for (const child of doc.feature.children) {
      if (child.scenario && child.scenario.id === scenarioId) {
        return child.scenario
      }
      if (child.rule) {
        for (const scenario of child.rule.children) {
          if (scenario.scenario && scenario.scenario.id === scenarioId) {
            return scenario.scenario
          }
        }
      }
    }
    throw new Error(`scenario "${scenarioId}" not found`)
  }
  private _getParameters(scenario: messages.Scenario, exampleId: string) {
    const parameters: Record<string, string> = {}
    if (scenario.examples.length === 0) return parameters
    for (const examples of scenario.examples) {
      for (const tableRow of examples.tableBody) {
        if (tableRow.id === exampleId) {
          for (let i = 0; i < examples.tableHeader.cells.length; i++) {
            parameters[examples.tableHeader.cells[i].value] =
              tableRow.cells[i].value
          }
        }
      }
    }
    return parameters
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

    const scenarioId = pickle.astNodeIds[0]
    const scenario = this._findScenario(doc, scenarioId)
    const scenarioName = scenario.name
    if (!this.scenarioIterationCountMap.has(scenarioId)) {
      this.scenarioIterationCountMap.set(scenarioId, 1)
    }
    const parameters = this._getParameters(scenario, pickle.astNodeIds[1])
    console.log(
      `Running scenario ${scenarioName} iteration ${this.scenarioIterationCountMap.get(
        scenarioId
      )} with parameters:\n${JSON.stringify(parameters, null, 4)}\n 
      `
    )
    this.scenarioIterationCountMap.set(
      scenarioId,
      this.scenarioIterationCountMap.get(scenarioId) + 1
    )
    const steps: JsonStep[] = pickle.steps.map((pickleStep) => {
      const stepId = pickleStep.astNodeIds[0]
      const step = this.stepMap.get(stepId)
      this.stepReportMap.set(pickleStep.id, {
        type: step.keywordType,
        keyword: step.keyword,
        text: step.text,
        commands: [],
        result: {
          status: 'UNKNOWN',
        },
        webLog: [],
      })
      return this.stepReportMap.get(pickleStep.id)
    })
    this.testCaseReportMap.set(id, {
      id,
      uri: pickle.uri,
      featureName,
      scenarioName,
      parameters,
      steps,
      result: {
        status: 'STARTED',
        startTime: this.getTimeStamp(timestamp),
      },
      webLog: [],
      networkLog: [],
      env: {
        name: this.report.env.name,
        baseUrl: this.report.env.baseUrl,
      },
    })
    this.report.testCases.push(this.testCaseReportMap.get(id))
  }
  private onTestStepStarted(testStepStarted: messages.TestStepStarted) {
    const { testStepId, timestamp } = testStepStarted
    const testStep = this.testStepMap.get(testStepId)
    if (testStep === undefined)
      throw new Error(`testStep with id ${testStepId} not found`)
    if (testStep.pickleStepId === undefined) return
    const stepProgess = this.stepReportMap.get(testStep.pickleStepId)
    stepProgess.result = {
      status: 'STARTED',
      startTime: this.getTimeStamp(timestamp),
    }
  }
  private onAttachment(attachment: messages.Attachment) {
    const { testStepId, body, mediaType } = attachment
    if (mediaType === 'text/plain') {
      this.reportFolder = body.replaceAll('\\', '/')
      return
    }
    if (mediaType === 'application/json+env') {
      const data = JSON.parse(body)
      this.report.env = data
      this.report.testCases.map((testCase) => {
        testCase.env = data
        return testCase
      })
    }
    if (mediaType === 'application/json+log') {
      const log: webLog = JSON.parse(body)
      if (this.logs.length < 1000) {
        this.logs.push(log)
        this.stepLogs.push(log)
      }
    }
    if (mediaType === 'application/json+network') {
      const networkLog = JSON.parse(body)
      if (this.networkLog.length < 1000) this.networkLog.push(networkLog)
    }
    const testStep = this.testStepMap.get(testStepId)
    if (testStep.pickleStepId === undefined) return

    const stepProgess = this.stepReportMap.get(testStep.pickleStepId)
    if (mediaType === 'application/json') {
      const command: JsonCommand = JSON.parse(body)
      stepProgess.commands.push(command)
    }
  }
  private onTestStepFinished(testStepFinished: messages.TestStepFinished) {
    const { testStepId, testStepResult, timestamp } = testStepFinished
    const testStep = this.testStepMap.get(testStepId)
    if (testStep.pickleStepId === undefined) {
      if (testStepResult.status === 'FAILED') {
        console.error(
          `Before/After hook failed with message: ${testStepResult.message}`
        )
      }
      return
    }
    if (testStepResult.status === 'UNDEFINED') {
      const step = this.stepReportMap.get(testStep.pickleStepId)
      const stepName = step ? step.keyword + ' ' + step.text : 'Undefined step'
      const undefinedCommand: messages.Attachment = {
        testStepId: testStepId,
        body: JSON.stringify({
          type: 'error',
          text: 'Undefined step: ' + stepName,
          result: {
            status: 'FAILED',
            startTime: this.getTimeStamp(timestamp),
            endTime: this.getTimeStamp(timestamp),
          },
        }),
        mediaType: 'application/json',
        contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
      }
      this.onAttachment(undefinedCommand)
    }
    const stepProgess = this.stepReportMap.get(testStep.pickleStepId)
    const prevStepResult = stepProgess.result as {
      status: 'STARTED'
      startTime: JsonTimestamp
    }
    let data = {}
    try {
      const reportFolder = this.reportFolder
      if (reportFolder === null) {
        throw new Error(
          '"reportFolder" is "null". Failed to run BVT hooks. Please retry after running "Generate All" or "Record Scenario" '
        )
      }
      if (fs.existsSync(path.join(reportFolder, 'data.json'))) {
        data = JSON.parse(
          fs.readFileSync(path.join(reportFolder, 'data.json'), 'utf8')
        )
      }
    } catch (error) {
      console.log('Error reading data.json')
    }
    stepProgess.result = {
      status: testStepResult.status,
      startTime: prevStepResult.startTime,
      endTime: this.getTimeStamp(timestamp),
      message: testStepResult.message,
      // exception: testStepResult.exception,
    }
    stepProgess.webLog = this.stepLogs
    this.stepLogs = []
    if (Object.keys(data).length > 0) {
      stepProgess.data = data
    }
  }
  getLogFileContent() {
    let projectPath = process.cwd()
    if (process.env.PROJECT_PATH) {
      projectPath = process.env.PROJECT_PATH
    }
    const logFolder = path.join(projectPath, 'logs', 'web')
    if (!fs.existsSync(logFolder)) {
      return []
    }
    let nextId = 1
    while (fs.existsSync(path.join(logFolder, `${nextId}.json`))) {
      nextId++
    }
    if (nextId === 1) {
      return []
    }
    try {
      const logFileContent = fs.readFileSync(
        path.join(logFolder, `${nextId - 1}.json`),
        'utf8'
      )
      return JSON.parse(logFileContent)
    } catch (error) {
      return []
    }
  }
  private getTestCaseResult(steps: JsonStep[]) {
    for (const step of steps) {
      switch (step.result.status) {
        case 'FAILED':
          return {
            status: step.result.status,
            message: step.result.message,
            // exception: step.result.exception,
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
  private async onTestCaseFinished(
    testCaseFinished: messages.TestCaseFinished
  ) {
    const { testCaseStartedId, timestamp } = testCaseFinished
    const testProgress = this.testCaseReportMap.get(testCaseStartedId)
    const prevResult = testProgress.result as {
      status: 'STARTED'
      startTime: JsonTimestamp
    }
    const steps = Object.values(testProgress.steps)
    const result = this.getTestCaseResult(steps)
    testProgress.result = {
      ...result,
      startTime: prevResult.startTime,
      endTime: this.getTimeStamp(timestamp),
    }
    testProgress.webLog = this.logs
    testProgress.networkLog = this.networkLog
    this.networkLog = []
    this.logs = []
    await this.uploadTestCase(testProgress)
  }
  private async uploadTestCase(testCase: JsonTestProgress) {
    let runId = ''
    let projectId = ''
    if (!process.env.UPLOADING_TEST_CASE) {
      process.env.UPLOADING_TEST_CASE = '[]'
    }
    const anyRemArr = JSON.parse(process.env.UPLOADING_TEST_CASE) as string[]
    const randomID = Math.random().toString(36).substring(7)
    anyRemArr.push(randomID)
    process.env.UPLOADING_TEST_CASE = JSON.stringify(anyRemArr)
    try {
      if (process.env.RUN_ID && process.env.PROJECT_ID) {
        runId = process.env.RUN_ID
        projectId = process.env.PROJECT_ID
      } else {
        const runDoc = await this.uploadService.createRunDocument(this.runName)
        runId = runDoc._id
        projectId = runDoc.project_id
        process.env.RUN_ID = runId
        process.env.PROJECT_ID = projectId
      }
      await this.uploadService.uploadTestCase(
        testCase,
        runId,
        projectId,
        this.reportFolder
      )
    } catch (e) {
      console.error('Error uploading test case:', e)
    } finally {
      const arrRem = JSON.parse(process.env.UPLOADING_TEST_CASE) as string[]
      arrRem.splice(arrRem.indexOf(randomID), 1)
      process.env.UPLOADING_TEST_CASE = JSON.stringify(arrRem)
    }
  }
  private onTestRunFinished(testRunFinished: messages.TestRunFinished) {
    const { timestamp, success, message } = testRunFinished
    const prevResult = this.report.result as {
      status: 'STARTED'
      startTime: JsonTimestamp
    }
    this.report.result = {
      status: success ? 'PASSED' : 'FAILED',
      startTime: prevResult.startTime,
      endTime: this.getTimeStamp(timestamp),
      message,
      // exception,
    }
  }
}
