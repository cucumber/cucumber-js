if (typeof define !== 'function') { var define = require('amdefine')(module); }
define("cucumber", [
    "./cucumber/ast",
    "./cucumber/debug",
    "./cucumber/listener",
    "./cucumber/parser",
    "./cucumber/runtime",
    "./cucumber/support_code",
    "./cucumber/tag_group_parser",
    "./cucumber/type",
    "./cucumber/util",
    "./cucumber/volatile_configuration"
], function(Ast, Debug, Listener, Parser, Runtime, SupportCode, TagGroupParser, Type, Util, VolatileConfiguration) {
    var Cucumber = function(featureSource, supportCodeInitializer, options) {
      var configuration = new Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer, options),
          runtime       = new Cucumber.Runtime(configuration);
      return runtime;
    };

    Cucumber.Ast                   = Ast;
    try { Cucumber.Cli             = require('./cucumber/cli'); } catch(e) {}
    Cucumber.Debug                 = Debug;
    Cucumber.Listener              = Listener;
    Cucumber.Parser                = Parser;
    Cucumber.Runtime               = Runtime;
    Cucumber.SupportCode           = SupportCode;
    Cucumber.TagGroupParser        = TagGroupParser;
    Cucumber.Type                  = Type;
    Cucumber.Util                  = Util;
    Cucumber.VolatileConfiguration = VolatileConfiguration;

    Cucumber.VERSION               = "0.2.12";

    return Cucumber;
});
