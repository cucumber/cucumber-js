require('../../support/spec_helper');

describe("Cucumber.Util.Array", function() {
  var Util = requireLib('cucumber').Util;
  var a1 = [1,2,3,4,5,6,7,8,9,10];
  var a2 = ["sdf","abc",2,-1,42,"sdf",71,42,100,89];

  describe("every()", function() {

    it("returns true when all iterators return true", function() {
      var result = Util.Array.every(a1, function(item) { return item < 11; });
      expect(result).toBe(true);
    });

    it("returns false when at least one iterator returns false", function() {
      var result = Util.Array.every(a1, function(item) { return item < 10; });
      expect(result).toBe(false);
    });
  });

  describe("some()", function() {

    it("returns true when at least one iterator return true", function() {
      var result = Util.Array.some(a1, function(item) { return item < 10; });
      expect(result).toBe(true);
    });

    it("returns false when all iterators return false", function() {
      var result = Util.Array.some(a1, function(item) { return item < 0; });
      expect(result).toBe(false);
    });
  });

  describe("map()", function() {

    it("transforms every element of the array according to the iterator", function() {
      var result = Util.Array.map(a1, function(item) { return item-1; });
      expect(result).toEqual([0,1,2,3,4,5,6,7,8,9]);
    });
  });

  describe("uniq()", function() {

    it("removes duplicate elements from the array", function() {
      var result = Util.Array.uniq(a2);
      expect(result).toEqual(["sdf","abc",2,-1,42,71,100,89]);
    });
  });
});
