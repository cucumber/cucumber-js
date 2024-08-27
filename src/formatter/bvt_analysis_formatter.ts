import { Envelope, Meta } from '@cucumber/messages'
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import path from 'path'
import { withFile } from 'tmp-promise'
import Formatter, { IFormatterOptions } from '.'
import { doesHaveValue } from '../value_checker'
import ReportGenerator, {
  JsonReport,
  JsonTestProgress,
  JsonTestResult,
  RetrainStats,
} from './helpers/report_generator'
import ReportUploader from './helpers/uploader'
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
      this.log('No test failed. No need to retrain\n')
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
      await this.uploadFinalReport(report)
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
    const finalTestCases = []
    for (const testCase of report.testCases) {
      const modifiedTestCase = await this.processTestCase(testCase, report)

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
      env: report.env,
    }
  }
  private async processTestCase(
    testCase: JsonTestProgress,
    report: JsonReport
  ): Promise<JsonTestProgress> {
    if (testCase.result.status === 'PASSED') {
      return testCase
    }
    const failedTestSteps = testCase.steps
      .map((step, i) => (step.result.status === 'FAILED' ? i : null))
      .filter((i) => i !== null)
    const retrainStats = await this.retrain(failedTestSteps, testCase)

    if (!retrainStats) {
      return testCase
    }

    return {
      ...testCase,
      retrainStats,
    }
  }

  private async uploadFinalReport(finalReport: JsonReport) {
    let success = true
    try {
      const { projectId, runId } = await this.uploader.uploadRun(
        finalReport,
        this.runName
      )
      this.logReportLink(runId, projectId)
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
    return await this.call_cucumber_client(failedTestCases, testCase)
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
        'undefined',
        `${stepsToRetrain.join(',')}`,
      ]

      if (process.env.BLINQ_ENV) {
        args.push(`--env=${process.env.BLINQ_ENV}`)
      }
      // const temporaryFileTask = await import('tempy')
      withFile(async ({ path: tempFile, fd }) => {
        // when this function returns or throws - release the file
        args.push(`--temp-file=${tempFile}`)
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
  }
  private logReportLink(runId: string, projectId: string) {
    let reportLinkBaseUrl = 'https://www.app.blinq.io'
    if (process.env.NODE_ENV_BLINQ === 'local') {
      reportLinkBaseUrl = 'http://localhost:3000'
    } else if (process.env.NODE_ENV_BLINQ === 'dev') {
      reportLinkBaseUrl = 'https://dev.app.blinq.io'
    } else if (process.env.NODE_ENV_BLINQ === 'stage') {
      reportLinkBaseUrl = 'https://stage.app.blinq.io'

    }
    const reportLink = `${reportLinkBaseUrl}/${projectId}/run-report/${runId}`
    this.log(`Report link: ${reportLink}\n`)
  }
}
