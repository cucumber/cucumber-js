import { WriteStream } from 'node:tty'
import { ProgressBarPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, stream }) {
    const printer = new ProgressBarPrinter({
      stream: stream as WriteStream,
    })
    on('message', (envelope) => printer.update(envelope))
    return () => printer.cleanup()
  },
} satisfies FormatterPlugin
