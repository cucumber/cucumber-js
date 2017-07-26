import _ from 'lodash'
import { CucumberExpressionGenerator } from 'cucumber-expressions'
import { KeywordType } from '../helpers'
import { buildStepArgumentIterator } from '../../step_arguments'

export default class StepDefinitionSnippetBuilder {
  constructor({ snippetSyntax, parameterTypeRegistry }) {
    this.snippetSyntax = snippetSyntax
    this.cucumberExpressionGenerator = new CucumberExpressionGenerator(
      parameterTypeRegistry
    )
  }

  build({ keywordType, pickleStep }) {
    const functionName = this.getFunctionName(keywordType)
    const generatedExpression = this.cucumberExpressionGenerator.generateExpression(
      pickleStep.text,
      true
    )
    const pattern = generatedExpression.source
    const parameters = this.getParameters(
      pickleStep,
      generatedExpression.parameterNames
    )
    const comment =
      'Write code here that turns the phrase above into concrete actions'
    return this.snippetSyntax.build(functionName, pattern, parameters, comment)
  }

  getFunctionName(keywordType) {
    switch (keywordType) {
      case KeywordType.EVENT:
        return 'When'
      case KeywordType.OUTCOME:
        return 'Then'
      case KeywordType.PRECONDITION:
        return 'Given'
    }
  }

  getParameters(step, expressionParameterNames) {
    return _.concat(
      expressionParameterNames,
      this.getStepArgumentParameters(step),
      'callback'
    )
  }

  getStepArgumentParameters(step) {
    const iterator = buildStepArgumentIterator({
      dataTable: () => 'table',
      docString: () => 'string'
    })
    return step.arguments.map(iterator)
  }
}
