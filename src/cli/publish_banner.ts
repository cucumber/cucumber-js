import chalk from 'chalk'
import Table from 'cli-table3'

const underlineBoldCyan = (x: string): string =>
  chalk.underline(chalk.bold(chalk.cyan(x)))

const formattedReportUrl = underlineBoldCyan('https://reports.cucumber.io')
const formattedEnv =
  chalk.cyan('CUCUMBER_PUBLISH_ENABLED') + '=' + chalk.cyan('true')
const formattedMoreInfoUrl = underlineBoldCyan(
  'https://cucumber.io/docs/cucumber/environment-variables/'
)

const text = `\
Share your Cucumber Report with your team at ${formattedReportUrl}

Command line option:    ${chalk.cyan('--publish')}
Environment variable:   ${formattedEnv}

More information at ${formattedMoreInfoUrl}

To disable this message, add this to your ${chalk.bold('./cucumber.js')}: 
${chalk.bold("module.exports = { default: '--publish-quiet' }")}`

const table = new Table({
  style: {
    head: [],
    border: ['green'],
  },
})

table.push([text])

export default table.toString()
