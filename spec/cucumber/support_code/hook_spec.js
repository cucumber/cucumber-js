require('../../support/spec_helper');

describe("Cucumber.SupportCode.Hook", function() {
  var Cucumber = requireLib('cucumber');
  var hook, code;

  beforeEach(function() {
    code = createSpy("hook code");
    hook = Cucumber.SupportCode.Hook(code);
  });

  describe("invoke()", function() {
    var world, callback;

    beforeEach(function() {
      world    = createSpy("world");
      callback = createSpy("callback");
    });

    it("calls the code with the world instance as this", function() {
      hook.invoke(world, callback);
      expect(code).toHaveBeenCalledWith(callback);
      expect(code.mostRecentCall.object).toBe(world);
    });
  });
});