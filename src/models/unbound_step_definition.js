import Definition from './definition'
import StepDefinition from './step_definition'
import { CucumberExpression, RegularExpression } from 'cucumber-expressions'

export default class UnboundStepDefinition extends Definition {
  constructor(args) {
    super(args)
    this.pattern = args.pattern
  }

  bindToParameterTypeRegistry(parameterTypeRegistry) {
    const { code, line, options, uri, pattern } = this

    const Expression =
      typeof pattern === 'string' ? CucumberExpression : RegularExpression

    const expression = new Expression(pattern, parameterTypeRegistry)

    return new StepDefinition({ code, line, options, uri, pattern, expression })
  }
}
