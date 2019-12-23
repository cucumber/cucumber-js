import { messages } from 'cucumber-messages'
import { ITestCaseHookParameter } from '../support_code_library_builder/types'

export interface IGetInvocationDataRequest {
  hookParameter: ITestCaseHookParameter
  step: messages.Pickle.IPickleStep
  world: any
}

export interface IGetInvocationDataResponse {
  getInvalidCodeLengthMessage: () => string
  parameters: any[]
  validCodeLengths: number[]
}

export interface IDefinitionOptions {
  timeout: number
  wrapperOptions: any
}

export interface IDefinition {
  readonly code: Function
  readonly id: string
  readonly line: string
  readonly options: IDefinitionOptions
  readonly unwrappedCode: Function
  readonly uri: string

  getInvocationParameters: (
    options: IGetInvocationDataRequest
  ) => Promise<IGetInvocationDataResponse>
}

export default abstract class Definition {
  public readonly code: Function
  public readonly id: string
  public readonly line: string
  public readonly options: IDefinitionOptions
  public readonly unwrappedCode: Function
  public readonly uri: string

  constructor({ code, id, line, options, unwrappedCode, uri }) {
    this.code = code
    this.id = id
    this.line = line
    this.options = options
    this.unwrappedCode = unwrappedCode
    this.uri = uri
  }

  buildInvalidCodeLengthMessage(
    syncOrPromiseLength: number | string,
    callbackLength: number | string
  ) {
    return (
      `function has ${this.code.length} arguments` +
      `, should have ${syncOrPromiseLength} (if synchronous or returning a promise)` +
      ` or ${callbackLength} (if accepting a callback)`
    )
  }

  baseGetInvalidCodeLengthMessage(parameters: any[]) {
    return this.buildInvalidCodeLengthMessage(
      parameters.length,
      parameters.length + 1
    )
  }
}
