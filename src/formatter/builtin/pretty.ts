import { PrettyPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, stream }) {
    const printer = new PrettyPrinter({
      stream,
      options: {
        summarise: true,
      },
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin
