import { PrettyPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'
import { FormatOptions } from '..'
import { resolveTerminalOptions } from './resolve_terminal_options'

export default {
  type: 'formatter',
  formatter({ on, stream, options }) {
    const printer = new PrettyPrinter({
      stream,
      options: {
        ...resolveTerminalOptions(options),
        ...options.pretty,
        summarise: true,
      },
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin<FormatOptions>
