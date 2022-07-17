/* eslint-disable no-console */
import isInstalledGlobally from 'is-installed-globally'

export async function validateInstall(): Promise<void> {
  if (isInstalledGlobally)
    console.warn(
      `
      You appear to be executing an install of cucumber (most likely a global install)
      that is different from your local install (the one required in your support files).
      For cucumber to work, you need to execute the same install that is required in your support files.
      Please execute the locally installed version to run your tests.
      `
    )
}
