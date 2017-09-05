const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn

// If installed as an unreleased git dependency, installs the dev dependencies
// and compiles the source.

const projectDir = path.join(__dirname, '..')

if (!process.env.building_non_release) {
  runIfDoesNotHaveLib(function() {
    runIfDoesNotHaveDevDependencies(function() {
      installDevDependencies()
    })
  })
}

function installDevDependencies() {
  const npmInstall = spawn('npm', ['install'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: Object.assign({}, process.env, { building_non_release: '1' })
  })
  npmInstall.on('close', function(code) {
    if (code !== 0) throw new Error('cucumber: `npm install` failed')
  })
}

function runIfDoesNotHaveDevDependencies(callback) {
  const devDependencyPath = path.join(
    projectDir,
    'node_modules',
    'babel-plugin-external-helpers'
  )
  runIfPathDoesNotExist(devDependencyPath, callback)
}

function runIfDoesNotHaveLib(callback) {
  runIfPathDoesNotExist(path.join(projectDir, 'lib'), callback)
}

function runIfPathDoesNotExist(filePath, callback) {
  fs.access(filePath, function(err) {
    if (err) {
      callback()
    }
  })
}
