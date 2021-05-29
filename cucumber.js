const feature = [
  '--require-module ts-node/register',
  '--require features/**/*.ts',
  `--format progress-bar`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
  '--format message:messages.ndjson',
  '--format html:html-formatter.html',
  '--publish-quiet',
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
  'examples-tables',
  'minimal',
  'parameter-types',
  'rules',
  'stack-traces',
  '--publish-quiet',
]

const htmlFormatter = [
  `node_modules/@cucumber/compatibility-kit/features/{${FORMATTERS_INCLUDE.join(
    ','
  )}}/*.feature`,
  '--require-module',
  'ts-node/register',
  '--require',
  `compatibility/features/{${FORMATTERS_INCLUDE.join(',')}}/*.ts`,
  '--format',
  'html:html-formatter.html',
  '--publish-quiet',
].join(' ')

module.exports = {
  default: feature,
  cck,
  htmlFormatter,
}
