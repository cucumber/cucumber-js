import GeneratedExpression from 'cucumber-expressions/dist/src/GeneratedExpression'

export interface ISnippetSyntaxBuildOptions {
  comment: string
  functionName: string
  generatedExpressions: GeneratedExpression[]
  stepParameterNames: string[]
}

export interface ISnippetSnytax {
  build(options: ISnippetSyntaxBuildOptions): string
}
