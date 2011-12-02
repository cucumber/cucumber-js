require('../../support/spec_helper');

describe("Cucumber.Util.Arguments", function() {
  var Cucumber = requireLib('cucumber');
  var argumentsObject, thisDuringSlice, argumentsArray;

  beforeEach(function() {
    argumentsObject = createSpy("Arguments object");
    argumentsArray  = createSpy("Arguments array");
    spyOn(Array.prototype, 'slice').andCallFake(function() {
      thisDuringSlice = this;
      return argumentsArray;
    });
  });

  it("calls Array.prototype.slice on the arguments object", function() {
    Cucumber.Util.Arguments(argumentsObject);
    expect(Array.prototype.slice).toHaveBeenCalled();
    expect(thisDuringSlice).toBe(argumentsObject);
  });

  it("returns the array created by slice()", function() {
    expect(Cucumber.Util.Arguments(argumentsObject)).toBe(argumentsArray);
  });
});
