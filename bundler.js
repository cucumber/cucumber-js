var fs = require('fs');
var through = require('through');
var browserify = require('browserify');
var exorcist = require('exorcist');

function fixGherkinLexers(file) {
  var data = '';

  function write (buf) { data += buf; }

  function end () {
    var ignoredFiles = [
      __dirname + '/lib/cucumber/cli.js'
    ];
    if (ignoredFiles.indexOf(file) > -1) {
      data = '';
    }
    this.queue(data);
    this.queue(null);
  }

  return through(write, end);
}

function Bundler(bundlePath) {
  var mapPath = bundlePath + '.map';

  var self = {
    bundle: function (callback) {
      var _callback = callback;
      callback = function (err) {
        if (_callback) _callback(err);
        _callback = null;
      };

      browserify({debug: true, standalone: 'Cucumber'})
        .transform({global: true}, fixGherkinLexers)
        // Disabled for now due to https://github.com/AndreasMadsen/stack-chain/issues/5
        //.transform({global:true}, 'uglifyify')
        .require('./bundle-main', { expose: 'cucumber' })
        .bundle()
        .on('error', callback)
        .pipe(exorcist(mapPath))
        .on('error', callback)
        .pipe(fs.createWriteStream(bundlePath, 'utf8'))
        .on('error', callback)
        .on('finish', callback);
    }
  };

  return self;
}

module.exports = Bundler;
