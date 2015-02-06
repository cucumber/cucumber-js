var gherkin = require('gherkin');

/**
 * Small wrapper around Gherkin that strips BOM and loads the correct lexer based
 * on the language header.
 */
function GherkinLexer(content, gherkinListener) {
  // Strip BOM
  content = content.replace(/^\ufeff/g, '');

  var language = 'en';
  var lines = content.split('\n');
  for (var l in lines) {
    var line = lines[l];
    if(!/^\s*#/.exec(line)) break;
    var languageMatch = /^\s*#\s*language:\s*([a-zA-Z-_]+)\s*$/m.exec(line);
    language = languageMatch === null ? 'en' : languageMatch[1].toLowerCase();
  }
  language = language.replace('-', '_');
  var Lexer = gherkin.Lexer(language);
  var lexer = new Lexer(gherkinListener);

  this.scan = function () {
    lexer.scan(content);
  };
}

module.exports = GherkinLexer;
