import * as messages from '@cucumber/messages'
import { ITestCaseHookParameter } from '../support_code_library_builder/types'
import { Expression } from '@cucumber/cucumber-expressions'

export interface IGetInvocationDataRequest {
  hookParameter: ITestCaseHookParameter
  step: messages.PickleStep
  world: any
}

export interface IGetInvocationDataResponse {
  getInvalidCodeLengthMessage: () => string
  parameters: any[]
  validCodeLengths: number[]
}

export interface IDefinitionOptions {
  timeout?: number
  wrapperOptions?: any
}

export interface IHookDefinitionOptions extends IDefinitionOptions {
  tags?: string
}

export interface IDefinitionParameters<T extends IDefinitionOptions> {
  code: Function
  id: string
  line: number
  options: T
  unwrappedCode?: Function
  uri: string
}

export interface IStepDefinitionParameters
  extends IDefinitionParameters<IDefinitionOptions> {
  pattern: string | RegExp
  expression: Expression
}

export interface IDefinition {
  readonly code: Function
  readonly id: string
  readonly line: number
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
  public readonly line: number
  public readonly options: IDefinitionOptions
  public readonly unwrappedCode: Function
  public readonly uri: string

  constructor({
    code,
    id,
    line,
    options,
    unwrappedCode,
    uri,
  }: IDefinitionParameters<IDefinitionOptions>) {
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
  ): string {
    return (
      `function has ${this.code.length.toString()} arguments` +
      `, should have ${syncOrPromiseLength.toString()} (if synchronous or returning a promise)` +
      ` or ${callbackLength.toString()} (if accepting a callback)`
    )
  }

  baseGetInvalidCodeLengthMessage(parameters: any[]): string {
    return this.buildInvalidCodeLengthMessage(
      parameters.length,
      parameters.length + 1
    )
  }
}
