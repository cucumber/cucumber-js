require('../../support/spec_helper');

describe("Cucumber.Runtime.EventBroadcaster", function () {
  var Cucumber = requireLib('cucumber');
  var eventBroadcaster, defaultTimeout, listeners;

  var createListener = function createListener(name) {
    var listener = createSpy(name);
    spyOnStub(listener, 'hear').and.callFake(function (event, defaultTimeout, cb) { cb(); });
    return listener;
  };

  beforeEach(function () {
    defaultTimeout = createSpy('default timeout');
    listeners = [createListener("First listener"), createListener("Second listener")];
    eventBroadcaster = Cucumber.Runtime.EventBroadcaster(listeners, defaultTimeout);
  });

  describe("broadcastAroundEvent()", function () {
    var preEvent, event, postEvent, userFunction;

    beforeEach(function (done) {
      preEvent = createSpy("pre event");
      postEvent = createSpy("post event");
      event = createSpyWithStubs("event", {replicateAsPostEvent: postEvent, replicateAsPreEvent: preEvent});
      userFunction = createSpy('user function').and.callFake(function(cb) { cb(); });
      eventBroadcaster.broadcastAroundEvent(event, userFunction, done);
    });

    it("broadcasts the before event", function () {
      expect(listeners[0].hear).toHaveBeenCalledWith(preEvent, defaultTimeout, jasmine.any(Function));
      expect(listeners[1].hear).toHaveBeenCalledWith(preEvent, defaultTimeout, jasmine.any(Function));
    });

    it("calls the user function", function () {
      expect(userFunction).toHaveBeenCalled();
    });

    it("broadcasts the after event", function () {
      expect(listeners[0].hear).toHaveBeenCalledWith(postEvent, defaultTimeout, jasmine.any(Function));
      expect(listeners[1].hear).toHaveBeenCalledWith(postEvent, defaultTimeout, jasmine.any(Function));
    });
  });

  describe("broadcastEvent()", function () {
    var event;

    beforeEach(function (done) {
      event = createSpy("event");
      eventBroadcaster.broadcastEvent(event, done);
    });

    it("broadcasts the event", function () {
      expect(listeners[0].hear).toHaveBeenCalledWith(event, defaultTimeout, jasmine.any(Function));
      expect(listeners[1].hear).toHaveBeenCalledWith(event, defaultTimeout, jasmine.any(Function));
    });
  });
});
