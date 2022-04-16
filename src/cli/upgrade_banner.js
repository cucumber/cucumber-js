import Table from 'cli-table3'
import colors from 'colors'

const text = `\
Cucumber is publishing new releases under ${colors.bold(
  '@cucumber/cucumber'
)} on npm:
${colors.cyan('https://www.npmjs.com/package/@cucumber/cucumber')}

Features in the latest version include:
${colors.cyan('*')} ${colors.italic('BeforeEach')} and ${colors.italic(
  'AfterEach'
)} hooks
${colors.cyan('*')} Searchable HTML reports
${colors.cyan('*')} Native ESM support
${colors.cyan('*')} Write scenarios in Markdown

Full changelog: ${colors.cyan(
  'https://github.com/cucumber/cucumber-js/blob/main/CHANGELOG.md'
)}
Upgrading guide: ${colors.cyan(
  'https://github.com/cucumber/cucumber-js/blob/main/UPGRADING.md'
)}`

const table = new Table({
  style: {
    head: [],
    border: ['green'],
  },
})
table.push([text])

export default table.toString()
