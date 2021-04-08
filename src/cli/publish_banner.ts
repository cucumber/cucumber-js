import colors from 'colors/safe'
import Table from 'cli-table3'

const underlineBoldCyan = (x: string): string =>
  colors.underline(colors.bold(colors.cyan(x)))

const formattedReportUrl = underlineBoldCyan('https://reports.cucumber.io')
const formattedEnv =
  colors.cyan('CUCUMBER_PUBLISH_ENABLED') + '=' + colors.cyan('true')
const formattedMoreInfoUrl = underlineBoldCyan(
  'https://reports.cucumber.io/docs/cucumber-js'
)

const text = `\
Share your Cucumber Report with your team at ${formattedReportUrl}

Command line option:    ${colors.cyan('--publish')}
Environment variable:   ${formattedEnv}

More information at ${formattedMoreInfoUrl}

To disable this message, add this to your ${colors.bold('./cucumber.js')}: 
${colors.bold("module.exports = { default: '--publish-quiet' }")}`

const table = new Table({
  style: {
    head: [],
    border: ['green'],
  },
})

table.push([text])

export default table.toString()
