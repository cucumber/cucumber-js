import { Envelope } from '@cucumber/messages'
import { spawn } from 'child_process'
import path from 'path'
import Formatter, { IFormatterOptions } from '.'
import { doesHaveValue } from '../value_checker'
import ReportGenerator, {
  JsonFixedByAi,
  JsonReport,
  JsonResultFailed,
  JsonResultPassed,
  JsonStep,
  JsonTestProgress,
  JsonTestResult,
} from './helpers/report_generator'
import ReportUploader from './helpers/uploader'
//User token
const TOKEN = process.env.TOKEN
export default class BVTAnalysisFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  private uploader = new ReportUploader(this.reportGenerator)
  private exit = false
  private START: number
  constructor(options: IFormatterOptions) {
    super(options)
    if (!TOKEN) {
      throw new Error('TOKEN must be set')
    }
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
      this.log('All tests passed. No need to retrain\n')
      await this.uploader.uploadRun(report)
      return
    }
    //checking if the type of report.result is JsonResultFailed or not
    if (!('startTime' in report.result) || !('endTime' in report.result)) {
      this.log('Unknown error occured,not retraining\n')
      await this.uploader.uploadRun(report)
      return
    }
    const finalReport = await this.processTestCases(report)
    await this.uploadFinalReport(finalReport)
  }
  private async processTestCases(report: JsonReport): Promise<JsonReport> {
    const finalResults: JsonTestResult[] = []
    const finalStepResults: JsonTestResult[][] = []
    let isFailing = true
    for (const testCase of report.testCases) {
      const { result, steps } = await this.processTestCase(testCase, report)
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
  private async processTestCase(
    testCase: JsonTestProgress,
    report: JsonReport
  ): Promise<{
    result: JsonFixedByAi | JsonResultFailed | JsonResultPassed
    steps: (JsonFixedByAi | JsonResultFailed | JsonResultPassed)[]
  }> {
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
    const success = await this.retrain(failedTestCases, testCase)
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
      startTime: this.createStartTime(testCase, report),
      endTime: Date.now(),
    }
  }
  private createStartTime(
    testCase: JsonTestProgress,
    report: JsonReport
  ): number {
    let startTime

    if ('startTime' in testCase.result) {
      startTime = testCase.result.startTime
    } else if ('startTime' in report.result) {
      startTime = report.result.startTime
    } else {
      startTime = Date.now()
    }

    return startTime
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
      this.log('Error uploading report\n')
    }

    this.log(JSON.stringify(finalReport, null, 2))
  }
  private async retrain(failedTestCases: number[], testCase: JsonTestProgress) {
    const stepsToRetrain = testCase.steps.map((_, i) => i)
    const success = await this.call_cucumber_client(stepsToRetrain, testCase)
    return success
  }

  private async call_cucumber_client(
    stepsToRetrain: number[],
    testCase: JsonTestProgress
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
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

      const cucumberClient = spawn('node', [cucumber_client_path, ...args], {
        env: {
          ...process.env,
        },
      })

      cucumberClient.stdout.on('data', (data) => {
        console.log(data.toString())
      })

      cucumberClient.stderr.on('data', (data) => {
        console.error(data.toString())
      })

      cucumberClient.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          this.log('Error retraining\n')
          resolve(false)
        }
      })
    })
  }
}
