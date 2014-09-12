var fs = require('fs');
var through = require('through');
var browserify = require('browserify');

function Bundler() {
  var source;

  var self = {
    middleware: function (req, res, next) {
      function serveBundle(res) {
        console.log("/cucumber.js 200", source.length);
        res.setHeader('Content-Type', 'application/javascript');
        res.write(source);
        res.end();
      };

      if (req.originalUrl === '/cucumber.js') {
        if (!source) {
          self.bundle(function (err) {
            if (err) return next(err);
            serveBundle(res);
          });
        } else {
          serveBundle(res);
        }
      } else {
        next();
      }
    },

    bundle: function (callback) {
      var bundler = browserify({debug: true, standalone: 'Cucumber'});
      bundler.transform({global: true}, function (file) {
        var data = '';
        return through(write, end);
        function write (buf) { data += buf }
        function end () {
          var path = __dirname + '/node_modules/gherkin/lib';
          var lexersPath = path + '/gherkin/lexer';
          if (file === path + '/gherkin.js') {
            // Patch gherkin so that all lexers are available statically:
            var bufferPrefix = '';
            var dirFiles = fs.readdirSync(lexersPath);
            dirFiles.forEach(function (dirFile) {
              var matches = dirFile.match(/^(.*)\.js$/);
              if (matches && !dirFile.match(/\.min\.js$/)) {
                bufferPrefix += "require('./gherkin/lexer/" + matches[1] + "');\n";
              }
            });
            data = bufferPrefix + data;
          }
          var ignoredFiles = [
            __dirname + '/lib/cucumber/cli.js'
          ];
          if (ignoredFiles.indexOf(file) > -1) {
            data = '';
          }
          this.queue(data);
          this.queue(null);
        }
      });
      bundler.transform({global:true}, 'uglifyify');
      bundler.exclude('./lib/cucumber/cli'); // TODO: doesn't work, fix this
      bundler.require('./bundle-main', { expose: 'cucumber' });
      bundler.bundle(function (err, _source, map) {
        if (err) return callback(err);
        source = _source;
        callback(null, source);
      });
    }
  };

  return self;
}

module.exports = Bundler;
