var connect    = require('connect');
var server     = connect.createServer();
var port       = process.env.PORT || 9797;

var staticDirs = [
  __dirname,
  __dirname.slice(0, __dirname.lastIndexOf("/"))
];

staticDirs.forEach(function (dir) {
  server.use(connect.static(dir));
});

server.listen(port);

console.log('Accepting connections on port ' + port + ' from ' + staticDirs.join(', ') + '...');