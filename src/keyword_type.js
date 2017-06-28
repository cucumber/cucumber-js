import _ from 'lodash'
import Gherkin from 'gherkin'

const types = {
  EVENT: 'event',
  OUTCOME: 'outcome',
  PRECONDITION: 'precondition'
}

export default types

export function getStepKeywordType({ language, previousStep, step }) {
  const dialect = Gherkin.DIALECTS[language]
  const type = _.find(['given', 'when', 'then', 'and', 'but'], keyword => {
    return _.includes(dialect[keyword], step.keyword)
  })
  switch (type) {
    case 'when':
      return types.EVENT
    case 'then':
      return types.OUTCOME
    case 'and':
    case 'but':
      if (previousStep) {
        return previousStep.keywordType
      }
    // fallthrough
    default:
      return types.PRECONDITION
  }
}
