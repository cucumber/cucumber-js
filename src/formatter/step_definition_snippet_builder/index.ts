import { KeywordType } from '../helpers'
import { parseStepArgument } from '../../step_arguments'
import { ISnippetSnytax } from './snippet_syntax'
import {
  CucumberExpressionGenerator,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export interface INewStepDefinitionSnippetBuilderOptions {
  snippetSyntax: ISnippetSnytax
  parameterTypeRegistry: ParameterTypeRegistry
}

export interface IBuildRequest {
  keywordType: KeywordType
  pickleStep: messages.PickleStep
}

export default class StepDefinitionSnippetBuilder {
  private readonly snippetSyntax: ISnippetSnytax
  private readonly cucumberExpressionGenerator: CucumberExpressionGenerator

  constructor({
    snippetSyntax,
    parameterTypeRegistry,
  }: INewStepDefinitionSnippetBuilderOptions) {
    this.snippetSyntax = snippetSyntax
    this.cucumberExpressionGenerator = new CucumberExpressionGenerator(
      () => parameterTypeRegistry.parameterTypes
    )
  }

  build({ keywordType, pickleStep }: IBuildRequest): string {
    const comment =
      'Write code here that turns the phrase above into concrete actions'
    const functionName = this.getFunctionName(keywordType)
    const generatedExpressions = this.cucumberExpressionGenerator.generateExpressions(
      pickleStep.text
    )
    const stepParameterNames = this.getStepParameterNames(pickleStep)
    return this.snippetSyntax.build({
      comment,
      functionName,
      generatedExpressions,
      stepParameterNames,
    })
  }

  getFunctionName(keywordType: KeywordType): string {
    switch (keywordType) {
      case KeywordType.Event:
        return 'When'
      case KeywordType.Outcome:
        return 'Then'
      case KeywordType.Precondition:
        return 'Given'
    }
  }

  getStepParameterNames(step: messages.PickleStep): string[] {
    if (doesHaveValue(step.argument)) {
      const argumentName = parseStepArgument(step.argument, {
        dataTable: () => 'dataTable',
        docString: () => 'docString',
      })
      return [argumentName]
    }
    return []
  }
}
