var fs = require('fs');
var through = require('through');
var browserify = require('browserify');
var exorcist = require('exorcist');
var path = require('path');

function fixGherkinLexers(file) {
  var data = '';
  var projectRoot = path.resolve(__dirname, '..', '..');

  function write (buf) { data += buf; }

  function end () {
    var path = projectRoot + '/node_modules/gherkin/lib';
    var lexersPath = path + '/gherkin/lexer';
    if (file === path + '/gherkin.js') {
      // Patch gherkin so that all lexers are available statically:
      var bufferPrefix = '';
      var dirFiles = fs.readdirSync(lexersPath);
      dirFiles.forEach(function (dirFile) {
        var matches = dirFile.match(/^(.*)\.js$/);
        if (matches && !dirFile.match(/\.min\.js$/)) {
          bufferPrefix += 'require("./gherkin/lexer/' + matches[1] + '");\n';
        }
      });
      data = bufferPrefix + data;
    }
    var ignoredFiles = [
      projectRoot + '/lib/cucumber/cli.js'
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

  this.bundle = function (callback) {
    var _callback = callback;
    callback = function (err) {
      if (_callback) _callback(err);
      _callback = null;
    };

    var main = path.join(__dirname, 'bundle-main');

    browserify({debug: true, standalone: 'Cucumber'})
      .transform({global: true}, fixGherkinLexers)
      .transform({global: true}, 'uglifyify')
      .require(main, { expose: 'cucumber' })
      .bundle()
      .on('error', callback)
      .pipe(exorcist(mapPath))
      .on('error', callback)
      .pipe(fs.createWriteStream(bundlePath, 'utf8'))
      .on('error', callback)
      .on('finish', callback);
  };
}

module.exports = Bundler;
