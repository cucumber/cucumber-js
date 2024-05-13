import axios from 'axios'
import FormData from 'form-data'
import { createReadStream } from 'fs'
import fs from 'fs/promises'
import { JsonReport } from './report_generator'
class RunUploadService {
  constructor(private runsApiBaseURL: string, private accessToken: string) {}
  async createRunDocument(name: string) {
    const runDocResult = await axios.post(
      this.runsApiBaseURL + '/cucumber-runs/create',
      {
        name: name ? name : 'TEST',
      },
      {
        headers: {
          Authorization: 'Bearer ' + this.accessToken,
          'x-source': 'cucumber_js',
        },
      }
    )
    if (runDocResult.status !== 200) {
      throw new Error('Failed to create run document in the server')
    }
    if (runDocResult.data.status !== true) {
      throw new Error('Failed to create run document in the server')
    }
    return runDocResult.data.run
  }
  async upload(formData: FormData) {
    const response = await axios.post(
      this.runsApiBaseURL + '/cucumber-runs/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: 'Bearer ' + this.accessToken,
          'x-source': 'cucumber_js',
        },
      }
    )
    if (response.status !== 200) {
      throw new Error('Failed to upload run to the server')
    }
    if (response.data.status !== true) {
      throw new Error('Failed to upload run to the server')
    }
  }
  async getPreSignedUrls(fileUris: string[], runId: string) {
    const response = await axios.post(
      this.runsApiBaseURL + '/cucumber-runs/generateuploadurls',
      {
        fileUris,
        runId,
      },
      {
        headers: {
          Authorization: 'Bearer ' + this.accessToken,
          'x-source': 'cucumber_js',
        },
      }
    )
    if (response.status !== 200) {
      throw new Error('Failed to get pre-signed urls for the files')
    }
    if (response.data.status !== true) {
      throw new Error('Failed to get pre-signed urls for the files')
    }

    return response.data.uploadUrls
  }

  async uploadFile(filePath: string, preSignedUrl: string) {
    const fileStream = createReadStream(filePath)

    try {
      const fileStats = await fs.stat(filePath)
      const fileSize = fileStats.size

      await axios.put(preSignedUrl, fileStream, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize,
        },
      })
      console.log('File uploaded successfully:', filePath)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      fileStream.close()
    }
  }
  async uploadComplete(runId: string, report: JsonReport) {
    const response = await axios.post(
      this.runsApiBaseURL + '/cucumber-runs/uploadcomplete',
      {
        runId,
        report,
      },
      {
        headers: {
          Authorization: 'Bearer ' + this.accessToken,
          'x-source': 'cucumber_js',
        },
      }
    )
    if (response.status !== 200) {
      throw new Error('Failed to mark run as complete')
    }
    if (response.data.status !== true) {
      throw new Error('Failed to mark run as complete')
    }
  }
}

export { RunUploadService }
