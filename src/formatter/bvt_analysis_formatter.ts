import { Envelope } from '@cucumber/messages'
import { exec, fork, spawn, spawnSync } from 'child_process'
import path from 'path'
import Formatter, { IFormatterOptions } from '.'
import { doesHaveValue } from '../value_checker'
import BVTFormatter from './bvt_formatter'
import ReportGenerator, {
  JsonFixedByAi,
  JsonReport,
  JsonResultFailed,
  JsonResultPassed,
  JsonStep,
  JsonTestProgress,
  JsonTestResult,
} from './helpers/report_generator'
//User token
const TOKEN = process.env.TOKEN
if (!TOKEN) {
  throw new Error('TOKEN must be set')
}
export default class BVTAnalysisFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  private uploader: BVTFormatter
  private exit = false
  private START: number
  constructor(options: IFormatterOptions) {
    super(options)

    this.uploader = new BVTFormatter(options, false)
    options.eventBroadcaster.on('envelope', async (envelope: Envelope) => {
      this.reportGenerator.handleMessage(envelope)
      if (doesHaveValue(envelope.testRunFinished)) {
        const report = this.reportGenerator.getReport()
        this.START = Date.now()
        await this.analyzeReport(report)
        this.exit = true
      }
    })
  }

  async finished(): Promise<any> {
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.exit) {
          clearInterval(checkInterval)
          resolve(null)
        }
      }, 100) // check every 100ms
    })
  }
  private async analyzeReport(report: JsonReport) {
    if (report.result.status === 'PASSED') {
      this.log('All tests passed. No need to retrain')
      await this.uploader.uploadRun(report)
      return
    }
    //checking if the type of report.result is JsonResultFailed or not
    if (!('startTime' in report.result) || !('endTime' in report.result)) {
      this.log('Unknown error occured,not retraining')
      await this.uploader.uploadRun(report)
      return
    }
    const finalReport = this.processTestCases(report)
    await this.uploadFinalReport(finalReport)
  }
  private processTestCases(report: JsonReport): JsonReport {
    const finalResults: JsonTestResult[] = []
    const finalStepResults: JsonTestResult[][] = []
    let isFailing = true
    for (const testCase of report.testCases) {
      const { result, steps } = this.processTestCase(testCase, report)
      finalResults.push(result)
      finalStepResults.push(steps)
      //If any of the test case fails, the whole run is considered failed
      if (result.status === 'FAILED') {
        isFailing = false
      }
    }
    return {
      result: isFailing
        ? {
            status: 'FIXED_BY_AI',
            startTime:
              'startTime' in report.result
                ? report.result.startTime
                : this.START,
            endTime: Date.now(),
          }
        : {
            status: 'FAILED',
            startTime:
              'startTime' in report.result
                ? report.result.startTime
                : Date.now(),
            endTime: Date.now(),
          },
      testCases: report.testCases.map((testCase, i) => {
        return {
          ...testCase,
          result: finalResults[i],
          steps: testCase.steps.map((step, j) => {
            return {
              ...step,
              result: finalStepResults[i][j],
            }
          }),
        }
      }),
    }
  }
  private processTestCase(
    testCase: JsonTestProgress,
    report: JsonReport
  ): {
    result: JsonFixedByAi | JsonResultFailed | JsonResultPassed
    steps: (JsonFixedByAi | JsonResultFailed | JsonResultPassed)[]
  } {
    if (testCase.result.status === 'PASSED') {
      return {
        result: testCase.result,
        steps: testCase.steps.map((step) => {
          return step.result.status === 'PASSED'
            ? step.result
            : this.createStepResult(true, step, report)
        }),
      }
    }
    const failedTestCases = testCase.steps
      .map((step, i) => (step.result.status !== 'PASSED' ? i : null))
      .filter((i) => i !== null)
    const success = this.retrain(failedTestCases, testCase)
    const finalResult = this.createFinalResult(success, testCase, report)

    return {
      result: finalResult,
      steps: testCase.steps.map((step) =>
        step.result.status === 'PASSED'
          ? { ...step.result }
          : this.createStepResult(success, step, report)
      ),
    }
  }

  private createFinalResult(
    success: boolean,
    testCase: JsonTestProgress,
    report: JsonReport
  ): JsonFixedByAi | JsonResultFailed {
    const status = success ? 'FIXED_BY_AI' : 'FAILED'
    return {
      status,
      startTime:
        'startTime' in testCase.result
          ? testCase.result.startTime
          : 'startTime' in report.result
          ? report.result.startTime
          : Date.now(),
      endTime: Date.now(),
    }
  }

  private createStepResult(
    success: boolean,
    step: JsonStep,
    report: JsonReport
  ): JsonFixedByAi | JsonResultFailed {
    const status = success ? 'FIXED_BY_AI' : 'FAILED'
    return {
      status,
      startTime:
        'startTime' in step.result
          ? step.result.startTime
          : 'startTime' in report.result
          ? report.result.startTime
          : Date.now(),
      endTime: Date.now(),
    }
  }
  private async uploadFinalReport(finalReport: JsonReport) {
    try {
      await this.uploader.uploadRun(finalReport)
    } catch (err) {
      console.log('Error uploading report')
    }

    console.log(JSON.stringify(finalReport, null, 2))
  }
  private retrain(failedTestCases: number[], testCase: JsonTestProgress) {
    const stepsToRetrain = testCase.steps.map((_, i) => i)
    return this.call_cucumber_client(stepsToRetrain, testCase)
  }

  private call_cucumber_client(
    stepsToRetrain: number[],
    testCase: JsonTestProgress
  ): boolean {
    const cucumber_client_path = path.resolve(
      process.cwd(),
      'node_modules',
      '@dev-blinq',
      'cucumber_client',
      'bin',
      'client',
      'cucumber.js'
    )

    const args: string[] = [
      process.cwd(),
      path.join(process.cwd(), testCase.uri),
      `${testCase.scenarioName}`,
      `${stepsToRetrain.join(',')}`,
    ]

    if (process.env.BLINQ_ENV) {
      args.push(`--env="${process.env.BLINQ_ENV}"`)
    }

    const cucumberClient = spawnSync('node', [cucumber_client_path, ...args], {
      env: {
        ...process.env,
      },
    })
    if (cucumberClient.stdout) {
      console.log(cucumberClient.stdout.toString())
    }
    if (cucumberClient.stderr) {
      console.error(cucumberClient.stderr.toString())
    }
    if (cucumberClient.status === 0) {
      return true
    }
    return false
  }
}
