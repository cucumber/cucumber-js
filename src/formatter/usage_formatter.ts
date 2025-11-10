import Table from 'cli-table3'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../value_checker'
import { formatLocation, getUsage } from './helpers'
import Formatter, { IFormatterOptions } from './'
import IEnvelope = messages.Envelope

export default class UsageFormatter extends Formatter {
  public static readonly documentation: string =
    'Prints where step definitions are used. The slowest step definitions (with duration) are listed first. If --dry-run is used the duration is not shown, and step definitions are sorted by filename instead.'

  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logUsage()
      }
    })
  }

  logUsage(): void {
    const usage = getUsage({
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    })
    if (usage.length === 0) {
      this.log('No step definitions')
      return
    }
    const table = new Table({
      head: ['Pattern / Text', 'Duration', 'Location'],
      style: {
        border: [],
        head: [],
      },
    })
    usage.forEach(
      ({ line, matches, meanDuration, pattern, patternType, uri }) => {
        let formattedPattern = pattern
        if (patternType === 'RegularExpression') {
          formattedPattern = '/' + formattedPattern + '/'
        }
        const col1 = [formattedPattern]
        const col2 = []
        if (matches.length > 0) {
          if (doesHaveValue(meanDuration)) {
            col2.push(
              `${messages.TimeConversion.durationToMilliseconds(
                meanDuration
              ).toFixed(2)}ms`
            )
          } else {
            col2.push('-')
          }
        } else {
          col2.push('UNUSED')
        }
        const col3 = [formatLocation({ line, uri })]
        matches.slice(0, 5).forEach((match) => {
          col1.push(`  ${match.text}`)
          if (doesHaveValue(match.duration)) {
            col2.push(
              `${messages.TimeConversion.durationToMilliseconds(
                match.duration
              ).toFixed(2)}ms`
            )
          } else {
            col2.push('-')
          }
          col3.push(formatLocation(match))
        })
        if (matches.length > 5) {
          col1.push(`  ${(matches.length - 5).toString()} more`)
        }
        table.push([col1.join('\n'), col2.join('\n'), col3.join('\n')] as any)
      }
    )
    this.log(`${table.toString()}\n`)
  }
}
