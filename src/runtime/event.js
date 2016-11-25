import _ from 'lodash'

export default class Event {
  constructor({data, name}) {
    this.data = data
    this.name = name
  }

  buildBeforeEvent() {
    return new Event({
      data: this.data,
      name: 'Before' + this.name,
    })
  }

  buildAfterEvent() {
    return new Event({
      data: this.data,
      name: 'After' + this.name,
    })
  }
}

_.assign(Event, {
  FEATURES_EVENT_NAME: 'Features',
  FEATURES_RESULT_EVENT_NAME: 'FeaturesResult',
  FEATURE_EVENT_NAME: 'Feature',
  SCENARIO_EVENT_NAME: 'Scenario',
  SCENARIO_RESULT_EVENT_NAME: 'ScenarioResult',
  STEP_EVENT_NAME: 'Step',
  STEP_RESULT_EVENT_NAME: 'StepResult'
})
