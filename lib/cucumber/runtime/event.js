var deprecatedMessageDisplayed = false;

function Event(name, payload) {
  var Cucumber = require('../../cucumber');

  function buildBeforeEventName(eventName) {
    return Cucumber.Events.getBeforeEvent(eventName);
  }

  function buildAfterEventName(eventName) {
    return Cucumber.Events.getAfterEvent(eventName);
  }

  payload.getPayloadItem = function getPayloadItem() {
    if (!deprecatedMessageDisplayed) {
      console.warn(
        'cucumber event handlers attached via registerHandler are now passed the' +
        ' associated object instead of an event' +
        '\ngetPayloadItem will be removed in the next major release'
      );
      deprecatedMessageDisplayed = true;
    }
    return payload;
  };

  var self = {
    getName: function getName() {
      return name;
    },

    getPayload: function getPayload() {
      return payload;
    },

    replicateAsPreEvent: function replicateAsPreEvent() {
      var newName = buildBeforeEventName(name);
      return Cucumber.Runtime.Event(newName, payload);
    },

    replicateAsPostEvent: function replicateAsPostEvent() {
      var newName = buildAfterEventName(name);
      return Cucumber.Runtime.Event(newName, payload);
    },

    occurredOn: function occurredOn(eventName) {
      return eventName === name;
    },

    occurredAfter: function occurredAfter(eventName) {
      var afterEventName = buildAfterEventName(eventName);
      return afterEventName === name;
    }
  };

  return self;
}

module.exports = Event;
