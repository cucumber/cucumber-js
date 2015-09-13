var path    = require('path');
var fs      = require('fs');
var Bundler = require('../bundler')

var bundlePath = path.join(__dirname, '..', 'release', 'cucumber.js');
var bundler = Bundler(bundlePath);
bundler.bundle(function (err) {
  if (err)
    console.error(err)
  else
    console.log(bundlePath, "written.");
});
