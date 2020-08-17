const feature = [
  '--require-module ts-node/register',
  '--require features/**/*.ts',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
  '--format message:messages.ndjson',
].join(' ')

const cck = [
  '--require-module',
  'ts-node/register',
  '--format',
  'message',
].join(' ')

const FORMATTERS_INCLUDE = [
  'attachments',
  'data-tables',
  'minimal',
  'parameter-types',
  'rules',
]

const formatters = [
  `node_modules/@cucumber/compatibility-kit/features/{${FORMATTERS_INCLUDE.join(
    ','
  )}}/*.feature`,
  '--require-module',
  'ts-node/register',
  '--require',
  `compatibility/features/{${FORMATTERS_INCLUDE.join(',')}}/*.ts`,
  '--format',
  'message',
].join(' ')

module.exports = {
  default: feature,
  cck,
  formatters,
}
