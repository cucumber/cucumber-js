export default class DocString {
  constructor(gherkinData) {
    this.content = gherkinData.content
    this.contentType = gherkinData.contentType
    this.line = gherkinData.location.line
  }
}
