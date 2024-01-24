import * as messages from '@cucumber/messages'
import Formatter, { IFormatterOptions } from '.'
import ReportGenerator, { JsonReport } from './helpers/report_generator'
import path from 'path'
import fs from 'fs'
import JSZip from 'jszip'
import FormData from "form-data";
import { RunUploadService } from './helpers/upload_serivce'

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL ;
const REPORT_SERVICE_TOKEN = process.env.REPORT_SERVICE_TOKEN;
if(!REPORT_SERVICE_URL || !REPORT_SERVICE_TOKEN){
    throw new Error("REPORT_SERVICE_URL and REPORT_SERVICE_TOKEN must be set")
}

export default class BVTFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  private uploadService =  new RunUploadService(REPORT_SERVICE_URL, REPORT_SERVICE_TOKEN);
  constructor(options: IFormatterOptions,upload = true ) {
    super(options)
    if(upload){
      options.eventBroadcaster.on('envelope', async (envelope: messages.Envelope) => {
        this.reportGenerator.handleMessage(envelope)
        if(envelope.testRunFinished){
          const report = this.reportGenerator.getReport();
          // this.log(JSON.stringify(report, null, 2))
          await this.uploadRun(report);
        }
      })
    }
  }
  async uploadRun(report:JsonReport){
    const runDoc = await this.uploadService.createRunDocument("test");
    const runDocId = runDoc._id;
    const formData = new FormData();
    const reportFolder = this.reportGenerator.reportFolder;
    if(!fs.existsSync(reportFolder)){
        fs.mkdirSync(reportFolder);
    }
    const zipPath = await this.createZip(reportFolder, report);
    console.log(zipPath);
    formData.append(runDocId, fs.readFileSync(zipPath), "report.zip");
    await this.uploadService.upload(formData);
    process.exit(0);
  }
  async createZip(reportFolder:string|null, report:JsonReport){
    const zip = new JSZip();
    zip.file("report.json", JSON.stringify(report, null, 2));
    const folder = zip.folder("screenshots");
    const files = fs.readdirSync(path.join(reportFolder, 'screenshots'));
    files.forEach((file) => {
      folder.file(file, fs.readFileSync(path.join(reportFolder, file)));
    });
    const zipBuffer =  await zip.generateAsync({ type: "nodebuffer" });
    // save zip file
    const zipPath = path.join(reportFolder,'report.zip');
    fs.writeFileSync(zipPath, zipBuffer);
    fs.writeFileSync(path.join(reportFolder,'report.json'), JSON.stringify(report, null, 2));
    return zipPath
  }
}