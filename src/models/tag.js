export default class Tag {
  static build(gherkinData) {
    return new Tag(gherkinData)
  }

  constructor(gherkinData) {
    this.line = gherkinData.location.line
    this.name = gherkinData.name
  }
}
