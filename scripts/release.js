var path    = require('path');
var fs      = require('fs');
var Bundler = require('../bundler')

var bundlePath = path.join(__dirname, '..', 'release', 'cucumber.js');
var bundler = Bundler();
bundler.bundle(function (err, bundle) {
  fs.writeFileSync(bundlePath, bundle);
  console.log(bundlePath, "written.");
});
