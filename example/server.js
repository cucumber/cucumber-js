var connect = require('connect');
var server = connect.createServer();

server.use(connect.static(__dirname));
server.use(require('browserify')({
  require: ['cucumber-html',
            {'cucumber': './lib/cucumber.js'},
            {'./gherkin/lexer/en': 'gherkin/lib/gherkin/lexer/en'}],
  ignore: ['./cucumber/cli', 'connect']
}));
var port = process.env.PORT || 9797;
server.listen(port);
console.log('Accepting connection on port '+port+'...');
