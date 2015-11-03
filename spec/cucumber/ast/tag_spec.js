require('../../support/spec_helper');

describe("Cucumber.Ast.Tag", function () {
  var Cucumber = requireLib('cucumber');
  var tag;

  beforeEach(function () {
    var tagData = {
      location: {line: 1},
      name: 'name'
    };
    tag = Cucumber.Ast.Tag(tagData);
  });

  describe("getName()", function () {
    it("returns the name", function () {
      expect(tag.getName()).toEqual('name');
    });
  });

  describe("getLine()", function () {
    it("returns the line", function () {
      expect(tag.getLine()).toEqual(1);
    });
  });
});
