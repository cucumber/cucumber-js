var _ = require('underscore');

function Syntax() {}
function JavaScriptSyntax() {}
function CoffeeScriptSyntax() {}

Syntax.prototype = {
  getStepDefinitionDocString: function () {
    return 'string';
  },

  getStepDefinitionDataTable: function () {
    return 'table';
  },

  getStepDefinitionCallback: function () {
    return 'callback';
  },

  getPatternStart: function () {
    return '/^';
  },

  getPatternEnd: function () {
    return '$/';
  },

  getContextStepDefinitionFunctionName: function () {
    return 'Given';
  },

  getEventStepDefinitionFunctionName: function () {
    return 'When';
  },

  getOutcomeStepDefinitionFunctionName: function () {
    return 'Then';
  },

  getNumberMatchingGroup: function () {
    return '(\\d+)';
  },

  getQuotedStringMatchingGroup: function () {
    return '"([^"]*)"';
  },

  getOutlineExampleMatchingGroup: function () {
    return '(.*)';
  },

  getFunctionParameterSeparator: function () {
    return ', ';
  },

  getStepDefinitionEndComment: function () {
    return 'Write code here that turns the phrase above into concrete actions';
  }
};

JavaScriptSyntax.prototype = {
  getStepDefinitionStart: function () {
    return 'this.';
  },

  getStepDefinitionInner1: function () {
    return '(';
  },

  getStepDefinitionInner2: function () {
    return ', function (';
  },

  getStepDefinitionEnd: function () {
    return ') {\n  // ' + this.getStepDefinitionEndComment() + '\n  callback.pending();\n});\n';
  },
};
_.extend(JavaScriptSyntax.prototype, Syntax.prototype);

CoffeeScriptSyntax.prototype = {
  getStepDefinitionStart: function () {
    return '@';
  },

  getStepDefinitionInner1: function () {
    return ' ';
  },

  getStepDefinitionInner2: function () {
    return ', (';
  },

  getStepDefinitionEnd: function () {
    return ') ->\n  # ' + this.getStepDefinitionEndComment() + '\n  callback.pending()\n';
  }
};
_.extend(CoffeeScriptSyntax.prototype, Syntax.prototype);

exports.JavaScript   = JavaScriptSyntax;
exports.CoffeeScript = CoffeeScriptSyntax;
