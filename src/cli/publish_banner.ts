import colors from 'colors/safe';
import Table from 'cli-table3';

const underlineBoldCyan = (x: string) => colors.underline(colors.bold(colors.cyan(x)))

const text = [
  'Share your Cucumber Report with your team at ' + underlineBoldCyan('https://reports.cucumber.io'),
  '',
  'Command line option:    ' + colors.cyan('--publish'),
  'Environment variable:   ' + colors.cyan('CUCUMBER_PUBLISH_ENABLED') + '=' + colors.cyan('true'),
  '',
  'More information at ' + underlineBoldCyan('https://reports.cucumber.io/docs/cucumber-js'),
  '',
  'To disable this message, add this to your ' + colors.bold('./cucumber.js') + ':',
  colors.bold("module.exports = { default: '--publish-quiet' }")
].join('\n')

const table = new Table({
  style: {
    head: [],
    border: ['green']
  }
});

table.push([text]);

export default table.toString()