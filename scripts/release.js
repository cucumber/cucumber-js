var path    = require('path');
var fs      = require('fs');
var Bundler = require('../bundler')

var bundlePath = path.join(__dirname, '..', 'release', 'cucumber.js');
var bundler = Bundler(bundlePath);
bundler.bundle(function (err) {
  console.log(bundlePath, "written.");
});
