require('../../support/spec_helper');

describe('Cucumber.Listener.Events', function () {
  var Cucumber = requireLib('cucumber');
  var events = Cucumber.Listener.Events;

  describe('construction', function () {
    it("contains a list of event names", function () {
      for(var name in events) {
        if(events.hasOwnProperty(name)) {
          expect(events[name]).toEqual(name);
        }
      }
    });

    it("is defined", function() {
        expect(events).toBeDefined();
    });
  });
});