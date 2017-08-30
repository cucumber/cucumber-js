var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

// If installed as an unreleased git dependency, installs the dev dependencies
// and compiles the source. Uses yarn by default. Set `CUCUMBER_UNRELEASED_BUILD_TOOL=npm`
// if you prefer to use npm (it's slower).

const buildTool = process.env.CUCUMBER_UNRELEASED_BUILD_TOOL || 'yarn'

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    // The lib dir doesn't exist, which means we need to compile sources with babel.
    // Install dev dependencies first (so we can run babel)
    var npmInstall = spawn(buildTool, ['install'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
    npmInstall.on('close', function(code) {
      if(code !== 0) throw new Error('cucumber: `' + buildTool + ' install` failed')
      var build = spawn(buildTool, ['run', 'build-local'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
      build.on('close', function(code) {
        if(code !== 0) throw new Error('cucumber: `' + buildTool + ' run build-local` failed')
      })
    })
  }
})
