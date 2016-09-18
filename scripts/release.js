var path = require('path');
var Bundler = require('./bundler');

var bundlePath = path.join(__dirname, '..', 'release', 'cucumber.js');
var bundler = new Bundler(bundlePath);
bundler.bundle(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
