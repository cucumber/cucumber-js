/* jshint -W106 */
var GherkinLexer = require('../../lib/cucumber/gherkin_lexer');

describe("GherkinLexer", function () {
  function noop() {}

  var handlers = {
    background:       noop,
    comment:          noop,
    doc_string:       noop,
    eof:              noop,
    feature:          noop,
    row:              noop,
    scenario:         noop,
    step:             noop,
    tag:              noop,
    scenario_outline: noop,
    examples:         noop
  };

  it("detects hyphenated language in header", function () {
    var l = new GherkinLexer('#language: en-lol\nMISHUN: NO BUGZ', handlers);
    l.scan();
  });

  it("detects underscored language in header (for backwards compat)", function () {
    var l = new GherkinLexer('#language: en_lol\nMISHUN: NO BUGZ', handlers);
    l.scan();
  });

  it("detects language header on 2nd line", function () {
    var l = new GherkinLexer('#\n#language: en_lol\nMISHUN: NO BUGZ', handlers);
    l.scan();
  });

  it("doesn't detect language in comments that aren't at the top", function () {
    var l = new GherkinLexer('Feature: No bugs\n#language: en-lol', handlers);
    l.scan();
  });

  it("happily parses features with BOM", function () {
    var l = new GherkinLexer('\ufeffFeature: No bugs\n#language: en-lol', handlers);
    l.scan();
  });
});
