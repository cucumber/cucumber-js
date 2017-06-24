/* eslint-disable babel/new-cap */

import {defineSupportCode} from '../../'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'
import Promise from 'bluebird'


const getTmpDir = Promise.promisify(tmp.dir)
const projectPath = path.join(__dirname, '..', '..')
const projectNodeModulesPath = path.join(projectPath, 'node_modules')
const moduleNames = fsExtra.readdirSync(projectNodeModulesPath)

defineSupportCode(function({After, Before}) {
  Before('@debug', function () {
    this.debug = true
  })

  Before(async function () {
    this.tmpDir = await getTmpDir({unsafeCleanup: true})

    const tmpDirProfilePath = path.join(this.tmpDir, 'cucumber.js')
    const profileContent = 'module.exports = {default: "--compiler js:babel-register"}'
    await fsExtra.writeFile(tmpDirProfilePath, profileContent)

    const tmpDirBabelRcPath = path.join(this.tmpDir, '.babelrc')
    const profileBabelRcPath = path.join(projectPath, '.babelrc')
    await fsExtra.createSymlink(profileBabelRcPath, tmpDirBabelRcPath)

    const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
    await Promise.map(moduleNames, async (moduleName) => {
      const tmpDirNodeModulePath = path.join(tmpDirNodeModulesPath, moduleName)
      const projectNodeModulePath = path.join(projectPath, 'node_modules', moduleName)
      return fsExtra.createSymlink(projectNodeModulePath, tmpDirNodeModulePath)
    })

    const tmpDirCucumberPath = path.join(tmpDirNodeModulesPath, 'cucumber')
    await fsExtra.createSymlink(projectPath, tmpDirCucumberPath)
    this.localExecutablePath = path.join(tmpDirCucumberPath, 'bin', 'cucumber.js')
  })

  Before('@global-install', async function () {
    const globalTmpDir = await getTmpDir({unsafeCleanup: true})

    const globalInstallNodeModulesPath = path.join(globalTmpDir, 'node_modules')
    await Promise.map(moduleNames, (moduleName) => {
      const globalInstallNodeModulePath = path.join(globalInstallNodeModulesPath, moduleName)
      const projectNodeModulePath = path.join(projectPath, 'node_modules', moduleName)
      return fsExtra.createSymlink(projectNodeModulePath, globalInstallNodeModulePath)
    })

    const globalInstallCucumberPath = path.join(globalInstallNodeModulesPath, 'cucumber')
    const itemsToCopy = ['bin', 'lib', 'package.json']
    await Promise.map(itemsToCopy, (item) => {
      return fsExtra.copySync(path.join(projectPath, item), path.join(globalInstallCucumberPath, item))
    })

    this.globalExecutablePath = path.join(globalInstallCucumberPath, 'bin', 'cucumber.js')
  })

  After(function() {
    if (this.lastRun.error && !this.verifiedLastRunError) {
      throw new Error(`Last run errored unexpectedly:\n${this.lastRun.output}`)
    }
  })
})
