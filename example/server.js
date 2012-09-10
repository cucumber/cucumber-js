var connect = require('connect');
var server  = connect.createServer();
var port    = process.env.PORT || 9797;
var Bundler = require('../bundler');

server.use(connect.static(__dirname));

var bundler = Bundler();
server.use(bundler);
server.listen(port);

console.log('Accepting connections on port ' + port + '...');
