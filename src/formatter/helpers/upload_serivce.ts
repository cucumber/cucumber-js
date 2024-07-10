/* eslint-disable no-console */
import FormData from 'form-data'
import { createReadStream } from 'fs'
import fs from 'fs/promises'
import { JsonReport } from './report_generator'
import { axiosClient } from '../../configuration/axios_client'

class RunUploadService {
  constructor(private runsApiBaseURL: string, private accessToken: string) {}
  async createRunDocument(name: string) {
    const runDocResult = await axiosClient.post(
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
    const response = await axiosClient.post(
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
    const response = await axiosClient.post(
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
    let success = true
    try {
      const fileStats = await fs.stat(filePath)
      const fileSize = fileStats.size

      await axiosClient.put(preSignedUrl, fileStream, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize,
        },
      })

    } catch (error) {
      if (process.env.NODE_ENV_BLINQ === 'dev') {
        console.error('Error uploading file:', error)
      }
      success = false
    } finally {
      fileStream.close()
    }
    return success
  }
  async uploadComplete(runId: string, report: JsonReport) {
    const response = await axiosClient.post(
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
