var browserify = require('browserify');

var Bundler = function () {
  var requires = [
    __dirname + '/node_modules/cucumber-html'
  ];

  var self = browserify({
    mount: '/cucumber.js',
    require: requires,
    ignore: ['./cucumber/cli', 'connect']
  });

  self.addEntry('underscore.js', {dirname: __dirname+"/node_modules/underscore", target: "/node_modules/underscore"});
  self.addEntry('lib/gherkin.js', {dirname: __dirname+"/node_modules/gherkin", target: "/node_modules/gherkin"});
  self.addEntry('lib/cucumber.js', {dirname: __dirname, target: "/cucumber"});
  self.addEntry('lib/gherkin/lexer/en.js', {dirname: __dirname+"/node_modules/gherkin", target: "/node_modules/gherkin/lexer/en"});

  self.prepend('(function(context) {');
  if (process.env.DEBUG_LEVEL)
    self.append("context.cucumberRequire = require;\n");
  self.append("context.Cucumber = require('/cucumber');\ncontext.CucumberHTML = require('cucumber-html/src/main/resources/cucumber/formatter/formatter');\n})(window);");

  return self;
};

module.exports = Bundler;