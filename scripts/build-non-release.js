var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

// If installed as an unreleased git dependency, installs the dev dependencies
// and compiles the source.

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    // The lib dir doesn't exist, which means we need to compile sources with babel.
    // Install dev dependencies first (so we can run babel)
    var npmInstall = spawn('npm', ['install'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
    npmInstall.on('close', function(code) {
      if(code !== 0) throw new Error('cucumber: `npm install` failed')
      var build = spawn('npm', ['run', 'build-local'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
      build.on('close', function(code) {
        if(code !== 0) throw new Error('cucumber: `npm run build-local` failed')
      })
    })
  }
})
