require('../../support/spec_helper');

describe("Cucumber.Type.HashDataTable", function () {
  var Cucumber = requireLib('cucumber');

  var hashDataTable, rawArray;

  beforeEach(function () {
    rawArray = [
      ['key1', 'key2'],
      ['value1-1', 'value1-2'],
      ['value2-1', 'value2-2']
    ];
    hashDataTable = Cucumber.Type.HashDataTable(rawArray);
  });

  describe("raw()", function () {
    var hashKeys, hashValueArrays, hashes;

    beforeEach(function () {
      hashKeys        = createSpy("hash keys");
      hashValueArrays = createSpy("hash value arrays");
      hashes          = createSpy("hashes");
      spyOn(hashDataTable, 'getHashKeys').andReturn(hashKeys);
      spyOn(hashDataTable, 'getHashValueArrays').andReturn(hashValueArrays);
      spyOn(hashDataTable, 'createHashesFromKeysAndValueArrays').andReturn(hashes);
    });

    it("gets the keys of the hashes", function () {
      hashDataTable.raw();
      expect(hashDataTable.getHashKeys).toHaveBeenCalled();
    });

    it("gets the values of the hashes", function () {
      hashDataTable.raw();
      expect(hashDataTable.getHashValueArrays).toHaveBeenCalled();
    });

    it("creates the hashes from the keys and values", function () {
      hashDataTable.raw();
      expect(hashDataTable.createHashesFromKeysAndValueArrays).toHaveBeenCalledWith(hashKeys, hashValueArrays);
    });

    it("returns the hashes", function () {
      expect(hashDataTable.raw()).toBe(hashes);
    });
  });

  describe("getHashKeys()", function () {
    it("returns the first row of the raw array", function () {
      expect(hashDataTable.getHashKeys()).toBe(rawArray[0]);
    });
  });

  describe("getHashValueArrays()", function () {
    it("returns all but the first raw of the raw array", function () {
      expect(hashDataTable.getHashValueArrays()).toEqual([rawArray[1], rawArray[2]]);
    });

    it("does not alter the original raw array", function () {
      hashDataTable.getHashValueArrays();
      expect(rawArray.length).toBe(3);
    });
  });

  describe("createHashesFromKeysAndValueArrays()", function () {
    var hashes, keys, valueArrays;

    beforeEach(function () {
      keys        = [createSpy("key 1"), createSpy("key 2")];
      valueArrays = [createSpy("value array 1"), createSpy("value array 2")];
      hashes      = [createSpy("first hash"), createSpy("second hash")];
      spyOn(hashDataTable, 'createHashFromKeysAndValues').andReturnSeveral(hashes);
    });

    it("creates a hash for each keys/values", function () {
      hashDataTable.createHashesFromKeysAndValueArrays(keys, valueArrays);
      expect(hashDataTable.createHashFromKeysAndValues).toHaveBeenCalledWith(keys, valueArrays[0]);
      expect(hashDataTable.createHashFromKeysAndValues).toHaveBeenCalledWith(keys, valueArrays[1]);
    });

    it("returns the hashes", function () {
      var actual = hashDataTable.createHashesFromKeysAndValueArrays(keys, valueArrays);
      expect(actual).toEqual(hashes);
    });
  });

  describe("createHashFromKeysAndValues()", function () {
    it("returns the combined keys and values as a hash", function () {
      var keys     = ["key1", "key2"];
      var values   = ["value1", "value2"];
      var actual   = hashDataTable.createHashFromKeysAndValues(keys, values);
      var expected = { key1: "value1", key2: "value2" };
      expect(actual).toEqual(expected);
    });
  });
});
