/* eslint-disable babel/new-cap */

import {defineSupportCode} from '../../'
import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

const projectPath = path.join(__dirname, '..', '..')

defineSupportCode(function({After, Before}) {
  Before('@debug', function () {
    this.debug = true
  })

  Before(function () {
    const tmpObject = tmp.dirSync({unsafeCleanup: true})
    this.tmpDir = tmpObject.name

    const tmpDirProfilePath = path.join(this.tmpDir, 'cucumber.js')
    const profileContent = 'module.exports = {default: "--compiler js:babel-register"}'
    fs.writeFileSync(tmpDirProfilePath, profileContent)

    const tmpDirBabelRcPath = path.join(this.tmpDir, '.babelrc')
    const profileBabelRcPath = path.join(projectPath, '.babelrc')
    fsExtra.createSymlinkSync(profileBabelRcPath, tmpDirBabelRcPath)

    const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
    const projectNodeModulesPath = path.join(projectPath, 'node_modules')

    const moduleNames = fs.readdirSync(projectNodeModulesPath)
    moduleNames.forEach((moduleName) => {
      const tmpDirNodeModulePath = path.join(tmpDirNodeModulesPath, moduleName)
      const projectNodeModulePath = path.join(projectPath, 'node_modules', moduleName)
      fsExtra.createSymlinkSync(projectNodeModulePath, tmpDirNodeModulePath)
    })

    const tmpDirCucumberPath = path.join(this.tmpDir, 'node_modules', 'cucumber')
    fsExtra.createSymlinkSync(projectPath, tmpDirCucumberPath)
  })

  After(function() {
    if (this.lastRun.error && !this.verifiedLastRunError) {
      throw new Error(`Last run errored unexpectedly:\n${this.lastRun.output}`)
    }
  })
})
