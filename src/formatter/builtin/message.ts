import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, write }) {
    on('message', (message) => write(JSON.stringify(message) + '\n'))
  },
  documentation: 'Emits Cucumber messages in NDJSON format',
} satisfies FormatterPlugin
