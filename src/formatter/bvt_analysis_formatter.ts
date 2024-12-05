import { Envelope, Meta } from '@cucumber/messages'
import { spawn } from 'child_process'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { tmpName } from 'tmp'
import Formatter, { IFormatterOptions } from '.'
import { doesHaveValue } from '../value_checker'
import ReportGenerator, {
  JsonReport,
  JsonTestProgress,
  JsonTestResult,
  RetrainStats,
} from './helpers/report_generator'
import ReportUploader from './helpers/uploader'
import os from 'os'
import { getProjectByAccessKey } from './api'
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
        await this.reportGenerator.handleMessage(envelope)
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
            // await this.uploadReport(report)
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
    if (
      report.result.status === 'PASSED' ||
      process.env.NO_RETRAIN === 'false'
    ) {
      if (report.result.status === 'PASSED') {
        this.log('No test failed. No need to retrain\n')
      }
      if (process.env.NO_RETRAIN === 'false') {
        this.log(
          'Retraining is skipped since the failed step contains an API request\n'
        )
      }
      // const uploadSuccessful = await this.uploadFinalReport(report)
      process.exit(0)
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
      logReportLink(runId, projectId)
    } catch (err) {
      this.log('Error uploading report\n')
      if ('stack' in err) {
        this.log(err.stack)
      }
      success = false
    } finally {
      try {
        writeFileSync(
          path.join(this.reportGenerator.reportFolder, 'report.json'),
          JSON.stringify(finalReport, null, 2),
          'utf-8'
        )
      } catch (e) {
        console.error('failed to write report.json to local disk')
      }
    }

    //this.log(JSON.stringify(finalReport, null, 2))
    return success
  }
  private async retrain(
    failedTestCases: number[],
    testCase: JsonTestProgress
  ): Promise<RetrainStats | null> {
    const data = await getProjectByAccessKey(TOKEN)
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000)
    if (data.project.expriration_date < currentTimestampInSeconds) {
      console.log(
        'Warning: Your project has expired, retraining is restricted. Please contact sales.'
      )
      process.exit(1)
    }
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

      if (!existsSync(path.join(this.getAppDataDir(), 'blinq.io', '.temp'))) {
        mkdir(path.join(this.getAppDataDir(), 'blinq.io', '.temp'), {
          recursive: true,
        })
      }

      tmpName(async (err, name) => {
        const tempFile = path.join(
          this.getAppDataDir(),
          'blinq.io',
          '.temp',
          path.basename(name)
        )
        console.log('File path: ', tempFile)
        await writeFile(tempFile, '', 'utf-8')

        args.push(`--temp-file=${tempFile}`)
        const cucumberClient = spawn('node', [cucumber_client_path, ...args], {
          env: {
            ...process.env,
            TEMP_FILE_PATH: tempFile,
          },
        })

        cucumberClient.stdout.on('data', (data) => {
          console.log(data.toString())
        })

        cucumberClient.stderr.on('data', (data) => {
          console.error(data.toString())
        })

        cucumberClient.on('close', async (code) => {
          if (code === 0) {
            const reportData = readFileSync(tempFile, 'utf-8')
            const retrainStats = JSON.parse(reportData) as RetrainStats
            await unlink(tempFile)
            resolve(retrainStats)
          } else {
            this.log('Error retraining\n')
            resolve(null)
          }
        })
      })
    })
  }

  private getAppDataDir() {
    if (process.env.BLINQ_APPDATA_DIR) {
      return process.env.BLINQ_APPDATA_DIR
    }

    let appDataDir: string

    switch (process.platform) {
      case 'win32':
        appDataDir = process.env.APPDATA!
        break
      case 'darwin':
        appDataDir = path.join(os.homedir(), 'Library', 'Application Support')
        break
      default:
        appDataDir = path.join(os.homedir(), '.config')
        break
    }
    return appDataDir
  }
}

export function logReportLink(runId: string, projectId: string) {
  let reportLinkBaseUrl = 'https://app.blinq.io'
  if (process.env.NODE_ENV_BLINQ === 'local') {
    reportLinkBaseUrl = 'http://localhost:3000'
  } else if (process.env.NODE_ENV_BLINQ === 'dev') {
    reportLinkBaseUrl = 'https://dev.app.blinq.io'
  } else if (process.env.NODE_ENV_BLINQ === 'stage') {
    reportLinkBaseUrl = 'https://stage.app.blinq.io'
  }
  const reportLink = `${reportLinkBaseUrl}/${projectId}/run-report/${runId}`
  console.log(`Report link: ${reportLink}\n`)
}
