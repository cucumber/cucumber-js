import { WriteStream } from 'node:tty'
import { ProgressBarPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'
import { FormatOptions } from '..'
import { resolveTerminalOptions } from './resolve_terminal_options'

export default {
  type: 'formatter',
  formatter({ on, stream, options }) {
    const printer = new ProgressBarPrinter({
      stream: stream as WriteStream,
      options: {
        ...resolveTerminalOptions(options),
        interference: {
          mode: 'suppress',
          streams: [process.stdout, process.stderr],
        },
        summarise: true,
      },
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin<FormatOptions>
