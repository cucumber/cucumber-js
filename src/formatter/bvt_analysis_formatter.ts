import { Envelope, Meta } from '@cucumber/messages'
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
  RetrainStats,
} from './helpers/report_generator'
import ReportUploader from './helpers/uploader'
// import { temporaryFileTask } from 'tempy'
import { readFileSync } from 'fs'
//User token
const TOKEN = process.env.TOKEN
interface MetaMessage extends Meta {
  runName: string
}

interface EnvelopeWithMetaMessage extends Envelope {
  meta: MetaMessage
}
export default class BVTAnalysisFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  private uploader = new ReportUploader(this.reportGenerator)
  private exit = false
  private START: number
  private runName: string
  constructor(options: IFormatterOptions) {
    super(options)
    if (!TOKEN && process.env.BVT_FORMATTER === 'ANALYSIS') {
      throw new Error('TOKEN must be set')
    }
    options.eventBroadcaster.on(
      'envelope',
      async (envelope: EnvelopeWithMetaMessage) => {
        this.reportGenerator.handleMessage(envelope)
        if (
          doesHaveValue(envelope.meta) &&
          doesHaveValue(envelope.meta.runName)
        ) {
          this.runName = envelope.meta.runName
        }
        if (doesHaveValue(envelope.testRunFinished)) {
          const report = this.reportGenerator.getReport()
          this.START = Date.now()
          if (process.env.BVT_FORMATTER === 'ANALYSIS') {
            await this.analyzeReport(report)
          } else {
            await this.uploadReport(report)
          }
          this.exit = true
        }
      }
    )
  }

  private async uploadReport(report: JsonReport) {
    const uploadSuccessful = await this.uploadFinalReport(report)
    if (uploadSuccessful && report.result.status !== 'FAILED') {
      process.exit(0)
    }
    process.exit(1)
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
      const uploadSuccessful = await this.uploadFinalReport(report)
      if (uploadSuccessful) {
        process.exit(0)
      }

      process.exit(1)
    }
    //checking if the type of report.result is JsonResultFailed or not
    this.log('Some tests failed, starting the retraining...\n')
    if (!('startTime' in report.result) || !('endTime' in report.result)) {
      this.log('Unknown error occured,not retraining\n')
      await this.uploader.uploadRun(report, this.runName)
      return
    }
    const finalReport = await this.processTestCases(report)
    const uploadSuccessful = await this.uploadFinalReport(finalReport)
    if (finalReport.result.status !== 'FAILED' && uploadSuccessful) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  }
  private async processTestCases(report: JsonReport): Promise<JsonReport> {
    // const finalResults: JsonTestResult[] = []
    // const finalStepResults: JsonTestResult[][] = []
    // let isFailing = true
    const finalTestCases = []
    for (const testCase of report.testCases) {
      const modifiedTestCase = await this.processTestCase(testCase, report)
      // finalResults.push(result)
      // finalStepResults.push(steps)
      // //If any of the test case fails, the whole run is considered failed
      // if (result.status === 'FAILED') {
      //   isFailing = false
      // }
      finalTestCases.push(modifiedTestCase)
    }
    const finalResult = finalTestCases.some(
      (tc) => tc.result.status !== 'PASSED'
    )
      ? report.result
      : ({
          ...report.result,
          status: 'PASSED',
        } as JsonTestResult)
    return {
      result: finalResult,
      testCases: finalTestCases,
    }
    // return {
    //   result: isFailing
    //     ? {
    //         status: 'FIXED_BY_AI',
    //         startTime:
    //           'startTime' in report.result
    //             ? report.result.startTime
    //             : this.START,
    //         endTime: Date.now(),
    //       }
    //     : {
    //         status: 'FAILED',
    //         startTime:
    //           'startTime' in report.result
    //             ? report.result.startTime
    //             : Date.now(),
    //         endTime: Date.now(),
    //       },
    //   testCases: report.testCases.map((testCase, i) => {
    //     return {
    //       ...testCase,
    //       result: finalResults[i],
    //       steps: testCase.steps.map((step, j) => {
    //         return {
    //           ...step,
    //           result: finalStepResults[i][j],
    //         }
    //       }),
    //     }
    //   }),
    // }
  }
  private async processTestCase(
    testCase: JsonTestProgress,
    report: JsonReport
  ): Promise<JsonTestProgress> {
    if (testCase.result.status === 'PASSED') {
      return testCase
    }
    const failedTestSteps = testCase.steps
      .map((step, i) => (step.result.status !== 'PASSED' ? i : null))
      .filter((i) => i !== null)
    const retrainStats = await this.retrain(failedTestSteps, testCase)
    // if(newTestCase.result.status === "PASSED") {
    //   newTestCase.result.status = "FIXED"
    // }
    if (!retrainStats) {
      return testCase
    }
    // const newResult: JsonTestResult =
    //   retrainStats.result.status === 'PASSED'
    //     ? {
    //         ...retrainStats.result,
    //         status: 'FIXED_BY_AI',
    //       }
    //     : retrainStats.result
    // const finalResult = this.createFinalResult(success, testCase, report)
    return {
      ...testCase,
      retrainStats,
    }
    // return {
    //   result: finalResult,
    //   steps: testCase.steps.map((step) =>
    //     step.result.status === 'PASSED'
    //       ? { ...step.result }
    //       : this.createStepResult(success, step, report)
    //   ),
    // }
  }

  // private createFinalResult(
  //   success: boolean,
  //   testCase: JsonTestProgress,
  //   report: JsonReport
  // ): JsonFixedByAi | JsonResultFailed {
  //   const status = success ? 'FIXED_BY_AI' : 'FAILED'
  //   return {
  //     status,
  //     startTime: this.createStartTime(testCase, report),
  //     endTime: Date.now(),
  //   }
  // }
  // private createStartTime(
  //   testCase: JsonTestProgress,
  //   report: JsonReport
  // ): number {
  //   let startTime

  //   if ('startTime' in testCase.result) {
  //     startTime = testCase.result.startTime
  //   } else if ('startTime' in report.result) {
  //     startTime = report.result.startTime
  //   } else {
  //     startTime = Date.now()
  //   }

  //   return startTime
  // }
  // private createStepResult(
  //   success: boolean,
  //   step: JsonStep,
  //   report: JsonReport
  // ): JsonFixedByAi | JsonResultFailed {
  //   const status = success ? 'FIXED_BY_AI' : 'FAILED'
  //   return {
  //     status,
  //     startTime:
  //       'startTime' in step.result
  //         ? step.result.startTime
  //         : 'startTime' in report.result
  //         ? report.result.startTime
  //         : Date.now(),
  //     endTime: Date.now(),
  //   }
  // }
  private async uploadFinalReport(finalReport: JsonReport) {
    let success = true
    try {
      await this.uploader.uploadRun(finalReport, this.runName)
    } catch (err) {
      this.log('Error uploading report\n')
      if ('stack' in err) {
        this.log(err.stack)
      }
      success = false
    }

    //this.log(JSON.stringify(finalReport, null, 2))
    return success
  }
  private async retrain(
    failedTestCases: number[],
    testCase: JsonTestProgress
  ): Promise<RetrainStats | null> {
    const stepsToRetrain = testCase.steps.map((_, i) => i)
    return await this.call_cucumber_client(stepsToRetrain, testCase)
    // const success = await this.call_cucumber_client(stepsToRetrain, testCase)
    // return success
  }

  private async call_cucumber_client(
    stepsToRetrain: number[],
    testCase: JsonTestProgress
  ): Promise<RetrainStats | null> {
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
        args.push(`--env=${process.env.BLINQ_ENV}`)
      }
      // const temporaryFileTask = await import('tempy')
      import('tempy').then(({ temporaryFileTask }) => {
        temporaryFileTask((tempFile) => {
          args.push(`--temp-file=${tempFile}`)
          const cucumberClient = spawn(
            'node',
            [cucumber_client_path, ...args],
            {
              env: {
                ...process.env,
              },
            }
          )

          cucumberClient.stdout.on('data', (data) => {
            console.log(data.toString())
          })

          cucumberClient.stderr.on('data', (data) => {
            console.error(data.toString())
          })

          cucumberClient.on('close', (code) => {
            if (code === 0) {
              const reportData = readFileSync(tempFile, 'utf-8')
              const retrainStats = JSON.parse(reportData) as RetrainStats
              resolve(retrainStats)
            } else {
              this.log('Error retraining\n')
              resolve(null)
            }
          })
        })
      })
    })
  }
}
