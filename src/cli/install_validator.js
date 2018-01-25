import { promisify } from 'bluebird'
import fs from 'mz/fs'
import path from 'path'
import resolve from 'resolve'

export async function validateInstall(cwd) {
  const projectPath = path.join(__dirname, '..', '..')
  if (projectPath === cwd) {
    return // cucumber testing itself
  }
  const currentCucumberPath = require.resolve(projectPath)
  let localCucumberPath = await promisify(resolve)('cucumber', {
    basedir: cwd,
  })
  localCucumberPath = await fs.realpath(localCucumberPath)
  if (localCucumberPath !== currentCucumberPath) {
    throw new Error(
      `
      You appear to be executing an install of cucumber (most likely a global install)
      that is different from your local install (the one required in your support files).
      For cucumber to work, you need to execute the same install that is required in your support files.
      Please execute the locally installed version to run your tests.

      Executed Path: ${currentCucumberPath}
      Local Path:    ${localCucumberPath}
      `
    )
  }
}
