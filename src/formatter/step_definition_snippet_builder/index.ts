import { KeywordType } from '../helpers'
import { parseStepArgument } from '../../step_arguments'
import { ISnippetSnytax } from './snippet_syntax'
import {
  CucumberExpressionGenerator,
  ParameterTypeRegistry,
} from 'cucumber-expressions'

export interface INewStepDefinitionSnippetBuilderOptions {
  snippetSyntax: ISnippetSnytax
  parameterTypeRegistry: ParameterTypeRegistry
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
      parameterTypeRegistry
    )
  }

  build({ keywordType, pickleStep }) {
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

  getFunctionName(keywordType) {
    switch (keywordType) {
      case KeywordType.Event:
        return 'When'
      case KeywordType.Outcome:
        return 'Then'
      case KeywordType.Precondition:
        return 'Given'
    }
  }

  getStepParameterNames(step) {
    if (step.argument) {
      const argumentName = parseStepArgument(step.argument, {
        dataTable: () => 'dataTable',
        docString: () => 'docString',
      })
      return [argumentName]
    }
    return []
  }
}
