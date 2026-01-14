import { SummaryPrinter } from '@cucumber/pretty-formatter'
import { Query } from '@cucumber/query'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, stream, write }) {
    const query = new Query()
    on('message', (envelope) => {
      query.update(envelope)
      if (envelope.testRunFinished) {
        new SummaryPrinter(stream, write).printSummary()
      }
    })
  },
} satisfies FormatterPlugin
