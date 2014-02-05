var path    = require('path');
var fs      = require('fs');
var Bundler = require('../bundler')

var bundlePath = path.join(__dirname, '..', 'release', 'cucumber.js');
var bundle = Bundler();
fs.writeFileSync(bundlePath, bundle.bundle());
console.log(bundlePath, "written.");