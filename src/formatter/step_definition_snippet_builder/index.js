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
    const comment =
      'Write code here that turns the phrase above into concrete actions'
    const functionName = this.getFunctionName(keywordType)
    const generatedExpressions = this.cucumberExpressionGenerator.generateExpressions(
      pickleStep.text,
      true
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
      case KeywordType.EVENT:
        return 'When'
      case KeywordType.OUTCOME:
        return 'Then'
      case KeywordType.PRECONDITION:
        return 'Given'
    }
  }

  getStepParameterNames(step) {
    const iterator = buildStepArgumentIterator({
      dataTable: () => 'dataTable',
      docString: () => 'docString',
    })
    return step.arguments.map(iterator)
  }
}
