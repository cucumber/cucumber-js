var connect = require('connect');
var server = connect.createServer();

server.use(connect.static(__dirname));
server.use(require('browserify')({
  require : __dirname + '/../lib/cucumber.js'
}));

server.listen(9797);
console.log('Listening on 9797...');