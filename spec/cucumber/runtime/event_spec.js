require('../../support/spec_helper');

describe("Cucumber.Runtime.Event", function () {
  var Cucumber = requireLib('cucumber');

  describe("non-instance method", function () {
  });

  describe("instance method", function () {
    var event, name, payload;

    beforeEach(function () {
      name = "SomeEvent";
      payload = createSpy('payload');
      event = Cucumber.Runtime.Event(name, payload);
    });

    describe("getName()", function () {
      it("returns the name of the event", function () {
        expect(event.getName()).toBe(name);
      });
    });

    describe("replicateAsPreEvent()", function () {
      var preEvent;

      beforeEach(function () {
        preEvent = createSpy("Pre-event (before)");
        spyOn(Cucumber.Runtime, 'Event').and.returnValue(preEvent);
      });

      it("creates a new event with the before prefix prepended to the event name and the same payload", function () {
        var newName = 'Before' + name;
        event.replicateAsPreEvent();
        expect(Cucumber.Runtime.Event).toHaveBeenCalledWith(newName, payload);
      });

      it("returns the new event", function () {
        expect(event.replicateAsPreEvent()).toBe(preEvent);
      });
    });

    describe("replicateAsPostEvent()", function () {
      var postEvent;

      beforeEach(function () {
        postEvent = createSpy("Post-event (after)");
        spyOn(Cucumber.Runtime, 'Event').and.returnValue(postEvent);
      });

      it("creates a new event with the after prefix prepended to the event name and the same payload", function () {
        var newName = 'After' + name;
        event.replicateAsPostEvent();
        expect(Cucumber.Runtime.Event).toHaveBeenCalledWith(newName, payload);
      });

      it("returns the new event", function () {
        expect(event.replicateAsPostEvent()).toBe(postEvent);
      });
    });

    describe("getPayload()", function () {
      it("returns the payload", function () {
        expect(event.getPayload()).toBe(payload);
      });
    });

    describe("occurredOn()", function () {
      it("returns true when the received event name matches the actual event name", function () {
        expect(event.occurredOn(name)).toBeTruthy();
      });

      it("returns false when the received event name does not match the actual event name", function () {
        expect(event.occurredOn("SomeOtherEvent")).toBeFalsy();
      });
    });

    describe("occurredAfter()", function () {
      beforeEach(function () {
        var afterName = 'After' + name;
        event = Cucumber.Runtime.Event(afterName, payload);
      });

      it("returns true when the received event name prefixed by the 'after' keyword matches the actual event name", function () {
        expect(event.occurredAfter(name)).toBeTruthy();
      });

      it("returns false when the received event name prefixed by the 'after' keyword does not match the actual event name", function () {
        expect(event.occurredAfter('SomeOtherEvent')).toBeFalsy();
      });
    });
  });
});
