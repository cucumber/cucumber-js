var _ = require('lodash');
var fs = require('fs');
var browserify = require('browserify');
var exorcist = require('exorcist');
var path = require('path');

function Bundler(bundlePath) {
  var mapPath = bundlePath + '.map';

  this.bundle = function (callback) {
    var wrappedCallback = _.once(callback);
    var main = path.join(__dirname, '..', 'lib', 'cucumber');

    browserify({debug: true, standalone: 'Cucumber'})
      .require(main, { expose: 'cucumber' })
      .bundle()
      .on('error', wrappedCallback)
      .pipe(exorcist(mapPath))
      .on('error', wrappedCallback)
      .pipe(fs.createWriteStream(bundlePath, 'utf8'))
      .on('error', wrappedCallback)
      .on('finish', wrappedCallback);
  };
}

module.exports = Bundler;
