import _ from 'lodash'
import {formatLocation, getUsage} from './helpers'
import Formatter from './'
import Table from 'cli-table'

export default class UsageFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const usage = getUsage({
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      stepResults: featuresResult.stepResults
    })
    if (usage.length === 0) {
      this.log('No step definitions')
      return
    }
    const table = new Table({
      head: [
        'Pattern / Text',
        'Duration',
        'Location'
      ],
      style: {
        border: [],
        head: []
      }
    })
    usage.forEach(({line, matches, meanDuration, pattern, uri}) => {
      let col1 = [pattern.toString()]
      let col2 = []
      if (matches.length > 0) {
        if (isFinite(meanDuration)) {
          col2.push(`${parseFloat(meanDuration.toFixed(2))}ms`)
        } else {
          col2.push('-')
        }
      } else {
        col2.push('UNUSED')
      }
      let col3 = [formatLocation(this.cwd, {line, uri})]
      _.take(matches, 5).forEach((match) => {
        col1.push(`  ${match.text}`)
        if (isFinite(match.duration)) {
          col2.push(`${match.duration}ms`)
        }
        else {
          col2.push('-')
        }
        col3.push(formatLocation(this.cwd, match))
      })
      if (matches.length > 5) {
        col1.push(`  ${matches.length - 5} more`)
      }
      table.push([col1.join('\n'), col2.join('\n'), col3.join('\n')])
    })
    this.log(table.toString() + '\n')
  }
}
