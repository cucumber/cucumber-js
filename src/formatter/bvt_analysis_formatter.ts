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
  constructor(options: IFormatterOptions) {
    super(options)

    this.uploader = new BVTFormatter(options, false)
    options.eventBroadcaster.on('envelope', async (envelope: Envelope) => {
      this.reportGenerator.handleMessage(envelope)
      if (doesHaveValue(envelope.testRunFinished)) {
        const report = this.reportGenerator.getReport()
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
      this.log('Unknow error occured,not retraining')
      await this.uploader.uploadRun(report)
      return
    }
    const finalResults: JsonTestResult[] = []
    const finalStepResults: JsonTestResult[][] = []
    for (const testCase of report.testCases) {
      if (testCase.result.status === 'PASSED') {
        finalResults.push({ ...testCase.result })
        continue
      }
      const stepsToRetrain = []
      for (let i = 0; i < testCase.steps.length; i++) {
        const step = testCase.steps[i]
        if (step.result.status === 'PASSED') {
          continue
        }
        stepsToRetrain.push(i)
      }
      const success = await this.retrain(stepsToRetrain, testCase)
      if (success) {
        const finalResult: JsonFixedByAi = {
          status: 'FIXED_BY_AI',
          startTime:
            'startTime' in testCase.result
              ? testCase.result.startTime
              : report.result.startTime,
          endTime: Date.now(),
        }
        finalResults.push(finalResult)
      } else {
        const finalResult: JsonResultFailed = {
          status: 'FAILED',
          startTime:
            'startTime' in testCase.result
              ? testCase.result.startTime
              : report.result.startTime,
          endTime: Date.now(),
        }
        finalResults.push(finalResult)
      }
      const stepResults = []
      for (let i = 0; i < testCase.steps.length; i++) {
        const step = testCase.steps[i]
        if (step.result.status === 'PASSED') {
          stepResults.push({ ...step.result })
          continue
        }
        if (success) {
          const stepResult: JsonFixedByAi = {
            status: 'FIXED_BY_AI',
            startTime:
              'startTime' in step.result
                ? step.result.startTime
                : report.result.startTime,
            endTime: Date.now(),
          }
          stepResults.push(stepResult)
          continue
        }

        const stepResult: JsonTestResult = {
          status: 'FAILED',
          startTime:
            'startTime' in step.result
              ? step.result.startTime
              : report.result.startTime,
          endTime: Date.now(),
        }
        stepResults.push(stepResult)
      }
      finalStepResults.push(stepResults)
    }

    const finalReport: JsonReport = {
      testCases: report.testCases.map((testCase, i) => ({
        ...testCase,
        result: finalResults[i],
        steps: testCase.steps.map((step, j) => ({
          ...step,
          result: finalStepResults[i][j],
        })),
      })),
      result: {
        ...report.result,
        endTime: Date.now(),
      },
    }
    try {
      await this.uploader.uploadRun(finalReport)
    } catch (err) {
      console.log('Error uploading report')
    }

    console.log(JSON.stringify(finalReport, null, 2))
  }

  private async retrain(stepsToRetrain: number[], testCase: JsonTestProgress) {
    stepsToRetrain = testCase.steps.map((_, i) => i)
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
