var connect    = require('connect');
var server     = connect.createServer();
var port       = process.env.PORT || 9797;
var static_dir = __dirname.slice(0, __dirname.lastIndexOf("/"));

server.use(connect.static(static_dir));
server.listen(port);

console.log('Accepting connections on port ' + port + ' from ' + static_dir + '...');
