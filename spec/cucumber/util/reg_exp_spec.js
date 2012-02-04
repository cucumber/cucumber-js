require('../../support/spec_helper');

describe("Cucumber.Util.RegExp", function() {
  var Cucumber = requireLib('cucumber');

  describe("escapeString()", function() {
    var escapeString = Cucumber.Util.RegExp.escapeString;

    it("escapes dashes", function() {
      expect(escapeString("-")).toBe("\\-");
    });

    it("escapes square brackets", function() {
      expect(escapeString("[]")).toBe("\\[\\]");
    });

    it("escapes curly brackets", function() {
      expect(escapeString("{}")).toBe("\\{\\}");
    });

    it("escapes parentheses", function() {
      expect(escapeString("()")).toBe("\\(\\)");
    });

    it("escapes asterisks", function() {
      expect(escapeString("*")).toBe("\\*");
    });

    it("escapes plusses", function() {
      expect(escapeString("+")).toBe("\\+");
    });

    it("escapes question marks", function() {
      expect(escapeString("?")).toBe("\\?");
    });

    it("escapes dots", function() {
      expect(escapeString(".")).toBe("\\.");
    });

    it("escapes backslashes", function() {
      expect(escapeString("\\")).toBe("\\\\");
    });

    it("escapes carets", function() {
      expect(escapeString("^")).toBe("\\^");
    });

    it("escapes dollar signs", function() {
      expect(escapeString("$")).toBe("\\$");
    });

    it("escapes pipes", function() {
      expect(escapeString("|")).toBe("\\|");
    });

    it("escapes hashes", function() {
      expect(escapeString("#")).toBe("\\#");
    });

    it("escapes new lines", function() {
      expect(escapeString("\n")).toBe("\\\n");
    });

    it("escapes forward slashes", function() {
      expect(escapeString("/")).toBe("\\/");
    });
  });
});
