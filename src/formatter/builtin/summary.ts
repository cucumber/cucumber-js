import { SummaryPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter: function ({ on, stream }) {
    const printer = new SummaryPrinter({
      stream,
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin
