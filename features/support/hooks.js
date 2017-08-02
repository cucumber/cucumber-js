/* eslint-disable babel/new-cap */

import { defineSupportCode } from '../../'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

const projectPath = path.join(__dirname, '..', '..')
const projectNodeModulesPath = path.join(projectPath, 'node_modules')
const moduleNames = fs.readdirSync(projectNodeModulesPath)

defineSupportCode(function({ After, Before }) {
  Before('@debug', function() {
    this.debug = true
  })

  Before('@spawn', function() {
    this.spawn = true
  })

  Before(function() {
    const tmpObject = tmp.dirSync({ unsafeCleanup: true })
    this.tmpDir = fs.realpathSync(tmpObject.name)

    const tmpDirProfilePath = path.join(this.tmpDir, 'cucumber.js')
    const profileContent =
      'module.exports = {default: "--compiler js:babel-register"}'
    fs.writeFileSync(tmpDirProfilePath, profileContent)

    const tmpDirBabelRcPath = path.join(this.tmpDir, '.babelrc')
    const profileBabelRcPath = path.join(projectPath, '.babelrc')
    fsExtra.createSymlinkSync(profileBabelRcPath, tmpDirBabelRcPath)

    const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
    moduleNames.forEach(moduleName => {
      const tmpDirNodeModulePath = path.join(tmpDirNodeModulesPath, moduleName)
      const projectNodeModulePath = path.join(
        projectPath,
        'node_modules',
        moduleName
      )
      fsExtra.createSymlinkSync(projectNodeModulePath, tmpDirNodeModulePath)
    })

    const tmpDirCucumberPath = path.join(tmpDirNodeModulesPath, 'cucumber')
    fsExtra.createSymlinkSync(projectPath, tmpDirCucumberPath)
    this.localExecutablePath = path.join(
      tmpDirCucumberPath,
      'bin',
      'cucumber.js'
    )
  })

  Before('@global-install', function() {
    const tmpObject = tmp.dirSync({ unsafeCleanup: true })

    const globalInstallNodeModulesPath = path.join(
      tmpObject.name,
      'node_modules'
    )
    moduleNames.forEach(moduleName => {
      const globalInstallNodeModulePath = path.join(
        globalInstallNodeModulesPath,
        moduleName
      )
      const projectNodeModulePath = path.join(
        projectPath,
        'node_modules',
        moduleName
      )
      fsExtra.createSymlinkSync(
        projectNodeModulePath,
        globalInstallNodeModulePath
      )
    })

    const globalInstallCucumberPath = path.join(
      globalInstallNodeModulesPath,
      'cucumber'
    )
    const itemsToCopy = ['bin', 'lib', 'package.json']
    itemsToCopy.forEach(item => {
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

  After(function() {
    if (this.lastRun.error && !this.verifiedLastRunError) {
      throw new Error(
        'Last run errored unexpectedly. Output:\n\n' +
          this.lastRun.output +
          '\n\n' +
          'Error Output:\n\n' +
          this.lastRun.errorOutput
      )
    }
  })
})
