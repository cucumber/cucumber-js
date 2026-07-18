import type { Expression } from '@cucumber/cucumber-expressions'
import type { PickleStep } from '@cucumber/messages'
import type { ITestCaseHookParameter } from '../support_code_library_builder/types'
import type { GherkinStepKeyword } from './gherkin_step_keyword'

export interface IGetInvocationDataRequest {
  hookParameter: ITestCaseHookParameter
  step: PickleStep
  // biome-ignore lint/suspicious/noExplicitAny: the world is an instance of a user-supplied constructor, so it really can be anything
  world: any
}

export interface IGetInvocationDataResponse {
  getInvalidCodeLengthMessage: () => string
  // biome-ignore lint/suspicious/noExplicitAny: step arguments are whatever the parameter types produce
  parameters: any[]
  validCodeLengths: number[]
}

export interface IDefinitionOptions {
  timeout?: number
  // biome-ignore lint/suspicious/noExplicitAny: opaque to us; passed straight through to the user's definition function wrapper
  wrapperOptions?: any
}

export interface IHookDefinitionOptions extends IDefinitionOptions {
  name?: string
  tags?: string
}

export interface IDefinitionParameters<T extends IDefinitionOptions> {
  code: Function
  id: string
  line: number
  options: T
  order: number
  unwrappedCode?: Function
  uri: string
}

export interface IStepDefinitionParameters extends IDefinitionParameters<IDefinitionOptions> {
  keyword: GherkinStepKeyword
  pattern: string | RegExp
  expression: Expression
}

export interface IDefinition {
  readonly code: Function
  readonly id: string
  readonly line: number
  readonly options: IDefinitionOptions
  readonly order: number
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
  public readonly order: number
  public readonly unwrappedCode: Function
  public readonly uri: string

  constructor({
    code,
    id,
    line,
    options,
    order,
    unwrappedCode,
    uri,
  }: IDefinitionParameters<IDefinitionOptions>) {
    this.code = code
    this.id = id
    this.line = line
    this.options = options
    this.order = order
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

  baseGetInvalidCodeLengthMessage(parameters: unknown[]): string {
    return this.buildInvalidCodeLengthMessage(parameters.length, parameters.length + 1)
  }
}
