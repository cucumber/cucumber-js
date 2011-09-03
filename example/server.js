var connect = require('connect');
var server = connect.createServer();

server.use(connect.static(__dirname));
server.use(require('browserify')({
  require: {'cucumber':           './lib/cucumber.js',
            './gherkin/lexer/en': 'gherkin/lib/gherkin/lexer/en'},
  ignore: ['./cucumber/cli']
}));
server.listen(9797);
console.log('Listening on port 9797...');
