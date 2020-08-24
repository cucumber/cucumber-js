import { After, Before, formatterHelpers } from '../../'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'
import { doesHaveValue } from '../../src/value_checker'
import { World } from './world'
import { ITestCaseHookParameter } from '../../src/support_code_library_builder/types'

const projectPath = path.join(__dirname, '..', '..')
const projectNodeModulesPath = path.join(projectPath, 'node_modules')
const moduleNames = fs.readdirSync(projectNodeModulesPath)

Before('@debug', function (this: World) {
  this.debug = true
})

Before('@spawn', function (this: World) {
  this.spawn = true
})

Before(function (
  this: World,
  { gherkinDocument, pickle }: ITestCaseHookParameter
) {
  const { line } = formatterHelpers.PickleParser.getPickleLocation({
    gherkinDocument,
    pickle,
  })
  this.tmpDir = path.join(
    projectPath,
    'tmp',
    `${path.basename(pickle.uri)}_${line.toString()}`
  )

  fsExtra.removeSync(this.tmpDir)

  const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
  const tmpDirCucumberPath = path.join(
    tmpDirNodeModulesPath,
    '@cucumber',
    'cucumber'
  )
  fsExtra.ensureSymlinkSync(projectPath, tmpDirCucumberPath)
  this.localExecutablePath = path.join(projectPath, 'bin', 'cucumber-js')
})

Before('@global-install', function (this: World) {
  const tmpObject = tmp.dirSync({ unsafeCleanup: true })

  const globalInstallNodeModulesPath = path.join(tmpObject.name, 'node_modules')
  moduleNames.forEach((moduleName) => {
    const globalInstallNodeModulePath = path.join(
      globalInstallNodeModulesPath,
      moduleName
    )
    const projectNodeModulePath = path.join(
      projectPath,
      'node_modules',
      moduleName
    )
    fsExtra.ensureSymlinkSync(
      projectNodeModulePath,
      globalInstallNodeModulePath
    )
  })

  const globalInstallCucumberPath = path.join(
    globalInstallNodeModulesPath,
    '@cucumber',
    'cucumber'
  )
  const itemsToCopy = ['bin', 'lib', 'package.json']
  itemsToCopy.forEach((item) => {
    fsExtra.copySync(
      path.join(projectPath, item),
      path.join(globalInstallCucumberPath, item)
    )
  })

  this.globalExecutablePath = path.join(
    globalInstallCucumberPath,
    'bin',
    'cucumber-js'
  )
})

After(function (this: World) {
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
