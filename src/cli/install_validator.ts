import fs from 'mz/fs'
import path from 'path'
import resolve from 'resolve'
import { promisify } from 'util'

export async function validateInstall(cwd: string): Promise<void> {
  const projectPath = path.join(__dirname, '..', '..')
  if (projectPath === cwd) {
    return // cucumber testing itself
  }
  const currentCucumberPath = require.resolve(projectPath)
  let localCucumberPath: string
  try {
    localCucumberPath = await promisify<string, resolve.Opts, string>(resolve)(
      '@cucumber/cucumber',
      {
        basedir: cwd,
      }
    )
  } catch (e) {
    throw new Error(
      '`@cucumber/cucumber` module not resolvable. Must be locally installed.'
    )
  }
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
