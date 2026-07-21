import path from 'node:path'
import fsExtra from 'fs-extra'
import {
  After,
  Before,
  formatterHelpers,
  type ITestCaseHookParameter,
  parallelCanAssignHelpers,
  setParallelCanAssign,
} from '../../'
import { doesHaveValue } from '../../src/value_checker'
import { warnUserAboutEnablingDeveloperMode } from './warn_user_about_enabling_developer_mode'
import type { World } from './world'

const projectPath = path.join(__dirname, '..', '..')

setParallelCanAssign(parallelCanAssignHelpers.atMostOnePicklePerTag(['@reports']))

Before('@debug', function (this: World) {
  this.debug = true
})

Before('@spawn or @esm', function (this: World) {
  this.spawn = true
})

Before(function (this: World, { gherkinDocument, pickle }: ITestCaseHookParameter) {
  const { line } = formatterHelpers.PickleParser.getPickleLocation({
    gherkinDocument,
    pickle,
  })
  this.tmpDir = path.join(projectPath, 'tmp', `${path.basename(pickle.uri)}_${line.toString()}`)

  fsExtra.removeSync(this.tmpDir)

  const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
  const tmpDirCucumberPath = path.join(tmpDirNodeModulesPath, '@cucumber', 'cucumber')
  try {
    fsExtra.ensureSymlinkSync(projectPath, tmpDirCucumberPath)
  } catch (error) {
    warnUserAboutEnablingDeveloperMode(error)
  }
  this.localExecutablePath = path.join(projectPath, 'bin', 'cucumber.js')
})

Before('@esm', function (this: World) {
  fsExtra.writeJSONSync(path.join(this.tmpDir, 'package.json'), {
    name: 'feature-test-pickle',
    type: 'module',
  })
})

Before('@without-require-esm', function (this: World) {
  if (process.features.require_module) {
    return 'skipped'
  }
  return undefined
})

After(async function (this: World) {
  if (
    doesHaveValue(this.lastRun) &&
    doesHaveValue(this.lastRun.error) &&
    !this.verifiedLastRunError
  ) {
    throw new Error(
      `Last run errored unexpectedly. Output:\n\n${this.lastRun.output}\n\n` +
        `Error Output:\n\n${this.lastRun.errorOutput}`
    )
  }
})
