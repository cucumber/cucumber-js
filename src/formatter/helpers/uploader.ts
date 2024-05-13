import ReportGenerator, { JsonReport } from './report_generator'
import { RunUploadService } from './upload_serivce'

import FormData from 'form-data'
import fs from 'fs'
import JSZip from 'jszip'
import path from 'path'
const URL =
  process.env.NODE_ENV_BLINQ === 'dev'
    ? 'https://dev.api.blinq.io/api/runs'
    : process.env.NODE_ENV_BLINQ === 'local'
    ? 'http://localhost:5001/api/runs'
    : 'https://api.blinq.io/api/runs'

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL ?? URL
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
    if (process.env.NODE_ENV_BLINQ === 'local') {
      const formData = new FormData()
      const zipPath = await this.createZip(reportFolder, report)
      formData.append(runDocId, fs.readFileSync(zipPath), 'report.zip')
      await this.uploadService.upload(formData)
    } else {
      const fileUris = getFileUrisScreenShotDir(reportFolder)
      console.log('fileUris', fileUris)
      try {
        const preSignedUrls = await this.uploadService.getPreSignedUrls(
          fileUris,
          runDocId
        )
        console.log('preSignedUrls', preSignedUrls)
        await Promise.all(
          fileUris
            .filter((fileUri) => preSignedUrls[fileUri])
            .map((fileUri) => {
              return this.uploadService.uploadFile(
                path.join(reportFolder, fileUri),
                preSignedUrls[fileUri]
              )
            })
        )
        await this.uploadService.uploadComplete(runDocId, report)
      } catch (err) {
        throw new Error('Failed to upload  all the files')
      }
    }
    return { runId: runDoc._id, projectId: runDoc.project_id }
  }
  async createZip(reportFolder: string | null, report: JsonReport) {
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
    fs.writeFileSync(zipPath, zipBuffer)
    fs.writeFileSync(
      path.join(reportFolder, 'report.json'),
      JSON.stringify(report, null, 2)
    )
    return zipPath
  }
}
const getFileUrisScreenShotDir = (reportFolder: string) => {
  const files = fs.readdirSync(path.join(reportFolder, 'screenshots'))

  return files.map((file) => path.join('screenshots', file))
}
