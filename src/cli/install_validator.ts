/* eslint-disable no-console */
import isInstalledGlobally from 'is-installed-globally'

export async function validateInstall(): Promise<void> {
  if (isInstalledGlobally)
    console.warn(
      `
      It looks like you're running Cucumber from a global installation.
      If so, you'll likely see issues - you need to have Cucumber installed as a local dependency in your project.
      See https://github.com/cucumber/cucumber-js/blob/main/docs/installation.md#invalid-installations
      `
    )
}
