var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

// If installed as an unreleased git dependency, installs the dev dependencies
// and compiles the source.

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    // The lib dir doesn't exist, which means we need to compile sources with babel.
    fs.access(path.join(__dirname, '..', 'node_modules', 'babel-plugin-external-helpers'), function(err) {
      if(err) {
        // Looks like we don't have babel - let's install all dev dependencies
        var npmInstall = spawn('npm', ['install'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
        npmInstall.on('close', function(code) {
          if(code !== 0) throw new Error('cucumber: `npm install` failed')
          buildLocal()
        })
      } else {
        buildLocal()
      }
    })

    function buildLocal() {
      var build = spawn('npm', ['run', 'build-local'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
      build.on('close', function(code) {
        if(code !== 0) throw new Error('cucumber: `npm run build-local` failed')
      })
    }
  }
})
