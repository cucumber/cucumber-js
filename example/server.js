var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');

var Bundler = require('../bundler');
var bundler = Bundler();

var port    = process.env.PORT || 9797;
var app = connect();
app.use(serveStatic(__dirname));
app.use(bundler.middleware);

console.log('Bundling Cucumber.js...');
bundler.bundle(function (err, source) {
  http.createServer(app).listen(port);
  console.log('Accepting connections on port ' + port + '...');
});
