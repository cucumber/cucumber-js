/* eslint-disable babel/new-cap */

import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

export default function hooks() {
  this.Before(function () {
    const tmpObject = tmp.dirSync({unsafeCleanup: true})
    this.tmpDir = fs.realpathSync(tmpObject.name)
    const tmpDirNodeModulesPath = path.join(this.tmpDir, 'node_modules')
    fs.mkdirSync(tmpDirNodeModulesPath)

    const projectPath = path.join(__dirname, '..', '..')

    const moduleNames = ['bluebird', 'coffee-script', 'is-generator', 'sinon']
    moduleNames.forEach(function(moduleName){
      const projectModulePath = path.join(projectPath, 'node_modules', moduleName)
      const tmpDirModulePath = path.join(tmpDirNodeModulesPath, moduleName)
      fsExtra.createSymlinkSync(projectModulePath, tmpDirModulePath)
    })

    const tmpDirCucumberPath = path.join(tmpDirNodeModulesPath, 'cucumber')
    fsExtra.createSymlinkSync(projectPath, tmpDirCucumberPath)
  })
}
