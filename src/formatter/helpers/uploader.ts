import axios from 'axios'
import ReportGenerator, {
  JsonReport,
  JsonTestProgress,
} from './report_generator'
import { RunUploadService } from './upload_serivce'

import FormData from 'form-data'
import fs, { writeFileSync } from 'fs'
import JSZip from 'jszip'
import path from 'path'
const URL =
  process.env.NODE_ENV_BLINQ === 'dev'
    ? 'https://dev.api.blinq.io/api/runs'
    : process.env.NODE_ENV_BLINQ === 'local'
    ? 'http://localhost:5001/api/runs'
    : process.env.NODE_ENV_BLINQ === 'stage'
    ? 'https://stage.api.blinq.io/api/runs'
    : process.env.NODE_ENV_BLINQ === 'prod'
    ? 'https://api.blinq.io/api/runs'
    : !process.env.NODE_ENV_BLINQ
    ? 'https://api.blinq.io/api/runs'
    : `${process.env.NODE_ENV_BLINQ}/api/runs`

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL ?? URL
const BATCH_SIZE = 10
const MAX_RETRIES = 3
const REPORT_SERVICE_TOKEN =
  process.env.TOKEN ?? process.env.REPORT_SERVICE_TOKEN

export default class ReportUploader {
  private uploadService = new RunUploadService(
    REPORT_SERVICE_URL,
    REPORT_SERVICE_TOKEN
  )
  private reportGenerator: ReportGenerator
  constructor(reportGenerator: ReportGenerator) {
    if (!REPORT_SERVICE_URL || !REPORT_SERVICE_TOKEN) {
      throw new Error('REPORT_SERVICE_URL and REPORT_SERVICE_TOKEN must be set')
    }
    this.reportGenerator = reportGenerator
  }

  async uploadRun(report: JsonReport, runName: string) {
    const runDoc = await this.uploadService.createRunDocument(runName)
    const runDocId = runDoc._id
    const reportFolder = this.reportGenerator.reportFolder
    if (!fs.existsSync(reportFolder)) {
      fs.mkdirSync(reportFolder)
    }
    writeFileSync(
      path.join(reportFolder, 'report.json'),
      JSON.stringify(report, null, 2)
    )
    if (process.env.NODE_ENV_BLINQ === 'local') {
      const formData = new FormData()
      const zipPath = await this.createZip(reportFolder, report)
      formData.append(runDocId, fs.readFileSync(zipPath), 'report.zip')
      await this.uploadService.upload(formData)
    } else {
      const fileUris = [
        ...getFileUris(reportFolder, 'screenshots'),
        ...getFileUris(reportFolder, 'trace'),
        'report.json',
        'network.json',
      ]
      try {
        const preSignedUrls = await this.uploadService.getPreSignedUrls(
          fileUris,
          runDocId
        )

        for (let i = 0; i < fileUris.length; i += BATCH_SIZE) {
          const batch = fileUris.slice(
            i,
            Math.min(i + BATCH_SIZE, fileUris.length)
          )
          await Promise.all(
            batch
              .filter((fileUri) => preSignedUrls[fileUri])
              .map(async (fileUri) => {
                for (let j = 0; j < MAX_RETRIES; j++) {
                  const success = await this.uploadService.uploadFile(
                    path.join(reportFolder, fileUri),
                    preSignedUrls[fileUri]
                  )
                  if (success) {
                    return
                  }
                }
                console.error('Failed to upload file:', fileUri)
              })
          )
        }
        await this.uploadService.uploadComplete(runDocId, runDoc.project_id)
      } catch (err) {
        throw new Error('Failed to upload  all the files')
      }
    }
    return { runId: runDoc._id, projectId: runDoc.project_id }
  }

  async modifyTestCase(testCase: JsonTestProgress) {
    const runId = process.env.RUN_ID
    if (!runId) {
      return
    }
    const projectId = process.env.PROJECT_ID
    if (!projectId) {
      return
    }
    await this.uploadService.modifyTestCase(runId, projectId, testCase)
  }
  async createZip(reportFolder: string | null, report: JsonReport) {
    if (reportFolder === null) {
      console.error('report folder is empty')
      console.error('it is likey that there are no scenarios to run')
      throw new Error('Empty report folder')
    }
    const zip = new JSZip()
    zip.file('report.json', JSON.stringify(report, null, 2))
    const folder = zip.folder('screenshots')
    const files = fs.readdirSync(path.join(reportFolder, 'screenshots'))
    files.forEach((file) => {
      folder.file(
        file,
        fs.readFileSync(path.join(reportFolder, 'screenshots', file))
      )
    })
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    // save zip file
    const zipPath = path.join(reportFolder, 'report.zip')
    fs.writeFileSync(zipPath, new Uint8Array(zipBuffer))
    fs.writeFileSync(
      path.join(reportFolder, 'report.json'),
      JSON.stringify(report, null, 2)
    )
    return zipPath
  }
}

const getFileUrisScreenShotDir = (reportFolder: string) => {
  const files = fs.readdirSync(path.join(reportFolder, 'screenshots'))

  return files.map((file) => ['screenshots', file].join('/'))
}

const getFileUris = (reportFolder: string, targetFolder: string) => {
  const resultFolder = path.join(reportFolder, targetFolder)
  if (!fs.existsSync(resultFolder)) {
    return []
  }
  const files = fs.readdirSync(resultFolder)
  return files.map((file) => [targetFolder, file].join('/'))
}
