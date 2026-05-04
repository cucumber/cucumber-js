import { SummaryPrinter } from '@cucumber/pretty-formatter'
import { FormatterPlugin } from '../../plugin'
import { FormatOptions } from '..'
import { resolveTerminalOptions } from './resolve_terminal_options'

export default {
  type: 'formatter',
  formatter({ on, stream, options }) {
    const printer = new SummaryPrinter({
      stream,
      options: resolveTerminalOptions(options),
    })
    on('message', (envelope) => printer.update(envelope))
  },
} satisfies FormatterPlugin<FormatOptions>
