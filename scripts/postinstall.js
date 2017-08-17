var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

fs.access(path.join(__dirname, '..', 'lib'), function(err) {
  if (err) {
    // lib does not exist, so we'll build
    var build = spawn('npm', ['run', 'build-local'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' })
    build.on('close', function(code) {
      console.log(`child process exited with code ${code}`)
      if(code !== 0) throw new Error('Failed to build Cucumber.js')
    })
    build.on('error', function(err) { throw err })
  }
})
