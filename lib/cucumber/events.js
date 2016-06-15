var _ = require('lodash');

var events = {
  FEATURES_EVENT_NAME: 'Features',
  FEATURES_RESULT_EVENT_NAME: 'FeaturesResult',
  FEATURE_EVENT_NAME: 'Feature',
  SCENARIO_EVENT_NAME: 'Scenario',
  SCENARIO_RESULT_EVENT_NAME: 'ScenarioResult',
  STEP_EVENT_NAME: 'Step',
  STEP_RESULT_EVENT_NAME: 'StepResult'
};

var BEFORE_EVENT_NAME_PREFIX = 'Before';
var AFTER_EVENT_NAME_PREFIX = 'After';

function getBeforeEvent(name) {
  return BEFORE_EVENT_NAME_PREFIX + name;
}

function getAfterEvent(name) {
  return AFTER_EVENT_NAME_PREFIX + name;
}

function getAroundEventsFor(name) {
  return [
    getBeforeEvent(name),
    getAfterEvent(name)
  ];
}

var allEvents = _.flatten(_.map(events, function(event) {
  if (_.includes(event, 'Result')) {
    return [event];
  } else {
    return getAroundEventsFor(event);
  }
}));

events.getBeforeEvent = getBeforeEvent;
events.getAfterEvent = getAfterEvent;
events.ALL = allEvents;

module.exports = events;
