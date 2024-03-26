const { argv } = require('node:process')
const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')
const { mkdirSync, writeFileSync } = require('node:fs')
const axios = require('axios').default
let token = null
let extractPath = null
const getSSoUrl = () => {
  switch (process.env.NODE_ENV_BLINQ) {
    case 'local':
      return 'http://localhost:5000/api/auth'
    case 'dev':
      return 'https://dev.api.blinq.io/api/auth'
    default:
      return 'https://api.blinq.io/api/auth'
  }
}

const getWorkSpaceUrl = () => {
  switch (process.env.NODE_ENV_BLINQ) {
    case 'local':
      return 'http://localhost:6000/api/workspace'
    case 'dev':
      return 'https://dev.api.blinq.io/api/workspace'
    default:
      return 'https://api.blinq.io/api/workspace'
  }
}

for (let i = 2; i < argv.length; i++) {
  const arg = argv[i]
  switch (arg) {
    case '--token':
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        token = argv[++i]
      } else {
        console.error('Error: --token argument provided without a token.')
        process.exit(1)
      }
      break
    case '--extractDir':
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        extractPath = argv[++i]
      } else {
        console.error('Error: --extractPath argument provided without a path.')
        process.exit(1)
      }
      break
    default:
      console.error(`Unexpected argument: ${arg}`)
      process.exit(1)
  }
}

if (token === null || token === undefined || token === '') {
  console.error('Error: --token argument not provided')
  process.exit(1)
}
if (extractPath === '' || extractPath === null || extractPath === undefined) {
  console.error('Error: --extractPath argument not provided')
  process.exit(1)
}
const dirExists = (path) => {
  try {
    return fs.statSync(path).isDirectory()
  } catch (e) {
    if (e.code == 'ENOENT') {
      // no such file or directory. File really does not exist
      console.log('Not a valid directory: ' + path)
      return false
    }

    console.log('Exception fs.statSync (' + path + '): ' + e)
    throw e // something else went wrong, we don't have rights, ...
  }
}
const ssoUrl = getSSoUrl()

const downloadAndInstall = async (extractPath, token) => {
  if (!dirExists(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true })
  }
  try {
    const accessKeyUrl = `${ssoUrl}/getProjectByAccessKey`
    const response = await axios.post(accessKeyUrl, {
      access_key: token,
    })
    if(response.status !== 200){
      console.error('Error: Invalid access key')
      process.exit(1)
    }

    const workspaceUrl = getWorkSpaceUrl() + '/pull-workspace'

    const res = await axios.get(workspaceUrl, {
      params: {
        projectId: response.data.project._id,
      },
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${token}`,
        'Response-Type': 'arraybuffer',
      },
    })
    if(res.data.status !== true){
      console.error('Error: Download failed')
      process.exit(1)
    }

    const zip = await JSZip.loadAsync(res.data)
    for (const filename of Object.keys(zip.files)) {
      const fileData = zip.files[filename]
      if (!fileData.dir) {
        const content = await fileData.async('nodebuffer')
        const filePath = path.join(extractPath, filename)
        mkdirSync(path.dirname(filePath), { recursive: true })
        writeFileSync(filePath, content)
      }
    }

    console.log('Extraction completed to:', extractPath)
  } catch (error) {
    console.error('Error:', error)
  }
}

downloadAndInstall(extractPath, token).then(() =>
  console.log('Download completed!')
)
