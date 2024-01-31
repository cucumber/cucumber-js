import ReportGenerator, { JsonReport } from './report_generator'
import { RunUploadService } from './upload_serivce'

import FormData from 'form-data'
import fs from 'fs'
import JSZip from 'jszip'
import path from 'path'
const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL
const REPORT_SERVICE_TOKEN = process.env.REPORT_SERVICE_TOKEN
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

  async uploadRun(report: JsonReport) {
    const runDoc = await this.uploadService.createRunDocument('test')
    const runDocId = runDoc._id
    const formData = new FormData()
    const reportFolder = this.reportGenerator.reportFolder
    if (!fs.existsSync(reportFolder)) {
      fs.mkdirSync(reportFolder)
    }
    const zipPath = await this.createZip(reportFolder, report)
    formData.append(runDocId, fs.readFileSync(zipPath), 'report.zip')
    await this.uploadService.upload(formData)
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
