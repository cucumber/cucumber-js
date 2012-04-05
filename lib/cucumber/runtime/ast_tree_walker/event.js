define([], function() {
var Event = function(name, payload) {

  function buildBeforeEventName(eventName) {
    return Event.BEFORE_EVENT_NAME_PREFIX + eventName;
  }

  function buildAfterEventName(eventName) {
    return Event.AFTER_EVENT_NAME_PREFIX + eventName;
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
      return Event(newName, payload);
    },

    replicateAsPostEvent: function replicateAsPostEvent() {
      var newName = buildAfterEventName(name);
      return Event(newName, payload);
    },

    occurredOn: function occurredOn(eventName) {
      return eventName == name;
    },

    occurredAfter: function occurredAfter(eventName) {
      var afterEventName = buildAfterEventName(eventName);
      return afterEventName == name;
    }
  };

  return self;
};

Event.BEFORE_EVENT_NAME_PREFIX            = 'Before';
Event.AFTER_EVENT_NAME_PREFIX             = 'After';
return Event;
});
