var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    console.log("*********** cucumber: lib does not exist")

    // If we're installed as a dependency, install our own node_modules,
    // which are required to run build-local
    fs.access(path.join(__dirname, '..', 'node_modules'), function(err) {
      if(err) {
        console.log("*********** cucumber: node_modules does not exist")
        var npmInstall = spawn('npm', ['install'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
        npmInstall.on('close', function(code) {
          if(code !== 0) throw new Error('cucumber: `npm install` failed')
          buildLocal()
        })
      } else {
        console.log("*********** cucumber: node_modules exist")
        buildLocal()
      }
    })

    function buildLocal() {
      var build = spawn('npm', ['run', 'build-local'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
      build.on('close', function(code) {
        if(code !== 0) throw new Error('cucumber: `npm run build-local` failed')
      })
    }
  } else {
    console.log("*********** cucumber: lib exists")
  }
})
