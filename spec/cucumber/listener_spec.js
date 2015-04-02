require('../support/spec_helper');

describe("Cucumber.Listener", function () {
  var Cucumber = requireLib('cucumber');
  var listener;

  beforeEach(function () {
    listener = Cucumber.Listener();
  });

  describe("hear()", function () {
    var event, callback;
    var eventHandler;

    beforeEach(function () {
      event    = createSpy("event");
      callback = createSpy("callback");
      spyOn(listener, 'hasHandlerForEvent');
      spyOn(listener, 'getHandlerForEvent');
    });

    it("checks whether there is a handler for the event", function () {
      listener.hear(event, callback);
      expect(listener.hasHandlerForEvent).toHaveBeenCalledWith(event);
    });

    describe("when there is a handler for that event", function () {
      beforeEach(function () {
        eventHandler = createSpy("Event handler (function)");
        listener.hasHandlerForEvent.andReturn(true);
        listener.getHandlerForEvent.andReturn(eventHandler);
      });

      it("gets the handler for that event", function () {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).toHaveBeenCalledWith(event);
      });

      it("calls the handler with the event and the callback", function () {
        listener.hear(event, callback);
        expect(eventHandler).toHaveBeenCalledWith(event, callback);
      });

      it("does not callback", function () {
        listener.hear(event, callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when there are no handlers for that event", function () {
      beforeEach(function () {
        listener.hasHandlerForEvent.andReturn(false);
      });

      it("calls back", function () {
        listener.hear(event, callback);
        expect(callback).toHaveBeenCalled();
      });

      it("does not get the handler for the event", function () {
        listener.hear(event, callback);
        expect(listener.getHandlerForEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe("hasHandlerForEvent", function () {
    var event, eventHandlerName, eventHandler;

    beforeEach(function () {
      event            = createSpy("Event");
      eventHandlerName = createSpy("event handler name");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("builds the name of the handler for that event", function () {
      listener.hasHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when the handler exists", function () {
      beforeEach(function () {
        eventHandler = createSpy("event handler");
        listener[eventHandlerName] = eventHandler;
      });

      it("returns true", function () {
        expect(listener.hasHandlerForEvent(event)).toBeTruthy();
      });
    });

    describe("when the handler does not exist", function () {
      it("returns false", function () {
        expect(listener.hasHandlerForEvent(event)).toBeFalsy();
      });
    });
  });

  describe("buildHandlerNameForEvent", function () {
    var event, eventName, buildHandlerName;

    beforeEach(function () {
      eventName = "SomeEventName";
      event     = createSpyWithStubs("Event", {getName: eventName});
      buildHandlerName = spyOn(listener, "buildHandlerName");
    });

    it("gets the name of the event", function () {
      listener.buildHandlerNameForEvent(event);
      expect(event.getName).toHaveBeenCalled();
    });

    it("calls buildHandlerName", function () {
      listener.buildHandlerNameForEvent(event);
      expect(buildHandlerName).toHaveBeenCalled();
    });
  });

  describe("getHandlerForEvent()", function () {
    var event;
    var eventHandlerName, eventHandler;

    beforeEach(function () {
      event            = createSpy("event");
      eventHandlerName = 'handleSomeEvent';
      eventHandler     = createSpy("event handler");
      spyOn(listener, 'buildHandlerNameForEvent').andReturn(eventHandlerName);
    });

    it("gets the name of the handler for the event", function () {
      listener.getHandlerForEvent(event);
      expect(listener.buildHandlerNameForEvent).toHaveBeenCalledWith(event);
    });

    describe("when an event handler exists for the event", function () {
      beforeEach(function () {
        listener[eventHandlerName] = eventHandler;
      });

      it("returns the event handler", function () {
        expect(listener.getHandlerForEvent(event)).toBe(eventHandler);
      });
    });

    describe("when no event handlers exist for the event", function () {
      it("returns nothing", function () {
        expect(listener.getHandlerForEvent(event)).toBeUndefined();
      });
    });
  });

  describe("buildHandlerName", function () {
    it("returns the name of the event with prefix 'handle' and suffix 'Event'", function () {
      var eventName = "shortName";
      var expected = "handle" + eventName + "Event";

      expect(listener.buildHandlerName(eventName)).toBe(expected);
    });
  });

  describe("setHandlerForEvent", function () {
    var shortName = "anEventName";
    var handler = function () {};
    var buildHandlerName;

    beforeEach(function () {
      buildHandlerName = spyOn(listener, "buildHandlerName").andCallThrough();
      listener.setHandlerForEvent(shortName, handler);
    });

    it("attaches the function as a property to itself", function () {
      var expectedKey = Cucumber.Listener.EVENT_HANDLER_NAME_PREFIX + shortName + Cucumber.Listener.EVENT_HANDLER_NAME_SUFFIX;
      expect(listener[expectedKey]).toBe(handler);
    });

    it("calls buildHandlerName", function () {
      expect(buildHandlerName).toHaveBeenCalled();
    });
  });
});
