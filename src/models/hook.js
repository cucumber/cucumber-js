export default class Hook {
  constructor({ keyword, scenario }) {
    this.keyword = keyword
    this.scenario = scenario
  }
}

Hook.BEFORE_STEP_KEYWORD = 'Before'
Hook.AFTER_STEP_KEYWORD = 'After'
