import Formatter from './'
import Status from '../status'
import KeywordType, { getStepKeywordType } from '../keyword_type'

export default class SnippetsFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on(
      'test-step-finished',
      ::this.logUndefinedTestStepSnippet
    )
    this.mapping = {}
  }

  logUndefinedTestStepSnippet({ testCase: { sourceLocation }, index, result }) {
    if (result.status === Status.UNDEFINED) {
      const {
        gherkinDocument,
        testCase
      } = this.eventDataCollector.getTestCaseData(sourceLocation)
      const {
        pickledStep,
        gherkinKeyword
      } = this.eventDataCollector.getTestStepData({ testCase, index })
      const previousKeywordType = this.getPreviousKeywordType({
        gherkinDocument,
        testCase,
        index
      })
      const keywordType = getStepKeywordType({
        keyword: gherkinKeyword,
        language: gherkinDocument.feature.language,
        previousKeywordType
      })
      const snippet = this.snippetBuilder.build({ keywordType, pickledStep })
      this.log(snippet + '\n\n')
    }
  }

  getPreviousKeywordType({ gherkinDocument, testCase, index }) {
    let previousKeywordType = KeywordType.PRECONDITION
    for (let i = 0; i < index; i += 1) {
      const { gherkinKeyword } = this.eventDataCollector.getTestStepData({
        testCase,
        index: i
      })
      previousKeywordType = getStepKeywordType({
        keyword: gherkinKeyword,
        language: gherkinDocument.feature.language,
        previousKeywordType
      })
    }
    return previousKeywordType
  }
}
