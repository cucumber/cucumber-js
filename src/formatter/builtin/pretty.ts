import { PrettyPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, stream, write }) {
    const printer = new PrettyPrinter(stream, write)
    on('message', (envelope) => {
      printer.update(envelope)
      if (envelope.testRunFinished) {
        printer.summarise()
      }
    })
  },
} satisfies FormatterPlugin
