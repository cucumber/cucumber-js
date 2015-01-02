var gherkin = require('gherkin');

/**
 * Small wrapper around Gherkin that strips BOM and loads the correct lexer based
 * on the language header.
 */
module.exports = function GherkinLexer(content, gherkinListener) {
  // Strip BOM
  content = content.replace(/^\ufeff/g, '');

  var languageMatch = /^\s*#\s*language:\s*([a-zA-Z-]+)\s*$/m.exec(content);
  var language = languageMatch == null ? 'en' : languageMatch[1].toLowerCase();
  var Lexer = gherkin.Lexer(language);
  var lexer = new Lexer(gherkinListener);

  this.scan = function() {
    lexer.scan(content);
  }
};
