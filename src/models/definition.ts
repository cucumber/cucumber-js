export default class Definition {
  public readonly code: Function
  public readonly id: string
  public readonly line: string
  public readonly uri: string
  // protected options: any

  constructor({ code, id, line, options, uri }) {
    this.code = code
    this.id = id
    this.line = line
    // this.options = options
    this.uri = uri
  }

  buildInvalidCodeLengthMessage(syncOrPromiseLength, callbackLength) {
    return (
      `function has ${this.code.length} arguments` +
      `, should have ${syncOrPromiseLength} (if synchronous or returning a promise)` +
      ` or ${callbackLength} (if accepting a callback)`
    )
  }

  getInvalidCodeLengthMessage(parameters) {
    return this.buildInvalidCodeLengthMessage(
      parameters.length,
      parameters.length + 1
    )
  }
}
