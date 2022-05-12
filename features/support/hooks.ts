import { After, Before, formatterHelpers, ITestCaseHookParameter } from '../../'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'
import { doesHaveValue } from '../../src/value_checker'
import { World } from './world'
import { warnUserAboutEnablingDeveloperMode } from './warn_user_about_enabling_developer_mode'

const projectPath = path.join(__dirname, '..', '..')

Before('@debug', function (this: World) {
  this.debug = true
})

Before('@spawn or @esm', function (this: World) {
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

Before('@global-install', function (this: World) {
  const tmpObject = tmp.dirSync({ unsafeCleanup: true })

  // Symlink everything in node_modules so the fake global install has all the dependencies it needs
  const projectNodeModulesPath = path.join(projectPath, 'node_modules')
  const projectNodeModulesDirs = fs.readdirSync(projectNodeModulesPath)
  const globalInstallNodeModulesPath = path.join(tmpObject.name, 'node_modules')
  projectNodeModulesDirs.forEach((nodeModuleDir) => {
    let pathsToLink = [nodeModuleDir]
    if (nodeModuleDir[0] === '@') {
      const scopeNodeModuleDirs = fs.readdirSync(
        path.join(projectNodeModulesPath, nodeModuleDir)
      )
      pathsToLink = scopeNodeModuleDirs.map((x) => path.join(nodeModuleDir, x))
    }
    pathsToLink.forEach((pathToLink) => {
      const globalInstallNodeModulePath = path.join(
        globalInstallNodeModulesPath,
        pathToLink
      )
      const projectNodeModulePath = path.join(
        projectNodeModulesPath,
        pathToLink
      )
      fsExtra.ensureSymlinkSync(
        projectNodeModulePath,
        globalInstallNodeModulePath
      )
    })
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
    'cucumber.js'
  )
})

After(async function (this: World) {
  if (this.reportServer?.started) {
    await this.reportServer.stop()
  }

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
