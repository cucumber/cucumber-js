import Feature from '../models/feature'
import Gherkin from 'gherkin'

const gherkinCompiler = new Gherkin.Compiler()
const gherkinParser = new Gherkin.Parser()

export default class Parser {
  static parse({ scenarioFilter, source, uri }) {
    let gherkinDocument
    try {
      gherkinDocument = gherkinParser.parse(source)
    } catch (error) {
      error.message += '\npath: ' + uri
      error.stack += '\npath: ' + uri
      throw error
    }

    if (gherkinDocument.feature) {
      return new Feature({
        gherkinData: gherkinDocument.feature,
        gherkinPickles: gherkinCompiler.compile(gherkinDocument, uri),
        scenarioFilter,
        uri
      })
    }
  }
}
