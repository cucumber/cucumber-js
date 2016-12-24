import _ from 'lodash'
import {getUsage} from './usage_helpers'
import Formatter from './'
import Table from 'cli-table'

export default class UsageFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      stepResults: featuresResult.stepResults
    })
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
    usage.forEach(({pattern, location, matches, meanDuration}) => {
      let col1 = [pattern.toString()]
      let col2 = []
      if (matches.length > 0) {
        col2.push(`${parseFloat(meanDuration.toFixed(2))}ms`)
      } else {
        col2.push('UNUSED')
      }
      let col3 = [location]
      _.take(matches, 5).forEach((match) => {
        col1.push(`  ${match.text}`)
        col2.push(`${match.duration}ms`)
        col3.push(match.location)
      })
      if (matches.length > 5) {
        col1.push(`  ${matches.length - 5} more`)
      }
      table.push([col1.join('\n'), col2.join('\n'), col3.join('\n')])
    })
    this.log(table.toString())
  }
}
