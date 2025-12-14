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
        // @ts-expect-error local linking
        new SummaryPrinter(query, stream, write).printSummary()
      }
    })
  },
} satisfies FormatterPlugin
