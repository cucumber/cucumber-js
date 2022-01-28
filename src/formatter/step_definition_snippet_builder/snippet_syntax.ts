import { GeneratedExpression } from '@cucumber/cucumber-expressions'

export enum SnippetInterface {
  AsyncAwait = 'async-await',
  Callback = 'callback',
  Generator = 'generator',
  Promise = 'promise',
  Synchronous = 'synchronous',
}

export interface ISnippetSyntaxBuildOptions {
  comment: string
  functionName: string
  generatedExpressions: readonly GeneratedExpression[]
  stepParameterNames: string[]
}

export interface ISnippetSnytax {
  build: (options: ISnippetSyntaxBuildOptions) => string
}
