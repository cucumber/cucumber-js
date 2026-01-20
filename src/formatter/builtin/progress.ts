import { ProgressPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter: function ({ on, stream }) {
    const printer = new ProgressPrinter({
      stream,
      options: {
        summarise: true
      }
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin
