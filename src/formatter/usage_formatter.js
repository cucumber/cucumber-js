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
        'Step Definition',
        'Mean Duration',
        'Matches'
      ],
      style: {
        border: [],
        head: []
      }
    })
    usage.forEach(({pattern, location, matches, meanDuration}) => {
      const col1 = [pattern.toString(), location].join('\n')
      let col2, col3
      if (matches.length > 0) {
        col2 = `${meanDuration}ms`
        col3 = matches.map(({duration, location, text}) => {
          return [text, location, `${duration}ms`].join('\n')
        }).join('\n\n')
      } else {
        col2 = 'UNUSED'
        col3 = 'UNUSED'
      }
      table.push([col1, col2, col3])
    })
    this.log(table.toString())
  }
}
