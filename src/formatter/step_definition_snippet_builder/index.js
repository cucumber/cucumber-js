import _ from 'lodash'
import {CucumberExpressionGenerator} from 'cucumber-expressions'
import DataTable from '../../models/step_arguments/data_table'
import DocString from '../../models/step_arguments/doc_string'
import KeywordType from '../../keyword_type'

export default class StepDefinitionSnippetBuilder {
  constructor({snippetSyntax, transformLookup}) {
    this.snippetSyntax = snippetSyntax
    this.cucumberExpressionGenerator = new CucumberExpressionGenerator(transformLookup)
  }

  build(step) {
    const functionName = this.getFunctionName(step)
    const generatedExpression = this.cucumberExpressionGenerator.generateExpression(step.name, true)
    const pattern = generatedExpression.source
    const parameters = this.getParameters(step, generatedExpression.transforms)
    const comment = 'Write code here that turns the phrase above into concrete actions'
    return this.snippetSyntax.build(functionName, pattern, parameters, comment)
  }

  getFunctionName(step) {
    switch(step.keywordType) {
      case KeywordType.EVENT: return 'When'
      case KeywordType.OUTCOME: return 'Then'
      case KeywordType.PRECONDITION: return 'Given'
    }
  }

  getParameters(step, expressionTranforms) {
    return _.concat(
      this.getPatternMatchingGroupParameters(expressionTranforms),
      this.getStepArgumentParameters(step),
      'callback'
    )
  }

  getPatternMatchingGroupParameters(expressionTranforms) {
    return _.times(expressionTranforms.length, function (n) {
      return `arg${n + 1}`
    })
  }

  getStepArgumentParameters(step) {
    return step.arguments.map(function (arg) {
      if (arg instanceof DataTable) {
        return 'table'
      } else if (arg instanceof DocString) {
        return 'string'
      } else {
        throw new Error(`Unknown argument type: ${arg}`)
      }
    })
  }
}
