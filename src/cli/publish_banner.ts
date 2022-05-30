import chalk from 'chalk'
import Table from 'cli-table3'

const chalkInstance = chalk.stderr

const underlineBoldCyan = (x: string): string =>
  chalkInstance.underline(chalkInstance.bold(chalkInstance.cyan(x)))

const formattedReportUrl = underlineBoldCyan('https://reports.cucumber.io')
const formattedEnv =
  chalkInstance.cyan('CUCUMBER_PUBLISH_ENABLED') +
  '=' +
  chalkInstance.cyan('true')
const formattedMoreInfoUrl = underlineBoldCyan(
  'https://cucumber.io/docs/cucumber/environment-variables/'
)

const text = `\
Share your Cucumber Report with your team at ${formattedReportUrl}

Command line option:    ${chalkInstance.cyan('--publish')}
Environment variable:   ${formattedEnv}

More information at ${formattedMoreInfoUrl}

To disable this message, add this to your ${chalkInstance.bold(
  './cucumber.js'
)}: 
${chalkInstance.bold("module.exports = { default: '--publish-quiet' }")}`

const table = new Table({
  style: {
    head: [],
    border: chalkInstance.supportsColor ? ['green'] : [],
  },
})

table.push([text])

export default table.toString()
