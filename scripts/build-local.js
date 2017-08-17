var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

// Runs `npm run build-local` if the lib dir is absent

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    // If we're installed as a dependency in another project, install our own node_modules,
    // which are required to run build-local
    fs.access(path.join(__dirname, '..', 'node_modules', 'babel-plugin-external-helpers'), function(err) {
      if(err) {
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
