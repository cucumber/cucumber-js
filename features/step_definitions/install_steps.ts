import path from 'node:path'
import fs from 'node:fs'
import tmp from 'tmp'
import fsExtra from 'fs-extra'
import { Given } from '../../'
import { World } from '../support/world'

/*
Simulates something like a global install, where the Cucumber being executed
is not the one being imported by support code
 */
Given('an invalid installation', async function (this: World) {
  const projectPath = path.join(__dirname, '..', '..')
  const tmpObject = tmp.dirSync({ unsafeCleanup: true })

  // Symlink everything in node_modules so the fake installation has all the dependencies it needs
  const projectNodeModulesPath = path.join(projectPath, 'node_modules')
  const projectNodeModulesDirs = fs.readdirSync(projectNodeModulesPath)
  const installationNodeModulesPath = path.join(tmpObject.name, 'node_modules')
  projectNodeModulesDirs.forEach((nodeModuleDir) => {
    let pathsToLink = [nodeModuleDir]
    if (nodeModuleDir[0] === '@') {
      const scopeNodeModuleDirs = fs.readdirSync(
        path.join(projectNodeModulesPath, nodeModuleDir)
      )
      pathsToLink = scopeNodeModuleDirs.map((x) => path.join(nodeModuleDir, x))
    }
    pathsToLink.forEach((pathToLink) => {
      const installationPackagePath = path.join(
        installationNodeModulesPath,
        pathToLink
      )
      const projectPackagePath = path.join(projectNodeModulesPath, pathToLink)
      fsExtra.ensureSymlinkSync(projectPackagePath, installationPackagePath)
    })
  })

  const invalidInstallationCucumberPath = path.join(
    installationNodeModulesPath,
    '@cucumber',
    'cucumber'
  )
  const itemsToCopy = ['bin', 'lib', 'package.json']
  itemsToCopy.forEach((item) => {
    fsExtra.copySync(
      path.join(projectPath, item),
      path.join(invalidInstallationCucumberPath, item)
    )
  })

  this.localExecutablePath = path.join(
    invalidInstallationCucumberPath,
    'bin',
    'cucumber.js'
  )
})
