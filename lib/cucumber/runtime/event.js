function Event(name, payload) {
  var Cucumber = require('../../cucumber');

  function buildBeforeEventName(eventName) {
    return Cucumber.Events.getBeforeEvent(eventName);
  }

  function buildAfterEventName(eventName) {
    return Cucumber.Events.getAfterEvent(eventName);
  }

  var self = {
    getName: function getName() {
      return name;
    },

    getPayloadItem: function getPayloadItem(itemName) {
      return payload[itemName];
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
