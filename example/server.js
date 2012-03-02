var connect    = require('connect');
var server     = connect.createServer();
var browserify = require('browserify');

var port       = process.env.PORT || 9797;
var cukeBundle = browserify({
  mount: '/cucumber.js',
  require: ['cucumber-html', './lib/cucumber', {'./gherkin/lexer/en': 'gherkin/lib/gherkin/lexer/en'}],
  ignore: ['./cucumber/cli', 'connect']
});

server.use(connect.static(__dirname));
server.use(cukeBundle);
server.listen(port);

console.log('Accepting connections on port ' + port + '...');
