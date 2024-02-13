import axios from 'axios'
import FormData from 'form-data'
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
          'Response-Type': 'arraybuffer',
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
}
export { RunUploadService }
