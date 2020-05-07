var common = [
  '--require-module ts-node/register',
  '--require features/**/*.ts',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
].join(' ')

var cck = [
  'node_modules/@cucumber/compatibility-kit/features/**/*.feature',
  '--require-module ts-node/register',
  '--require compatibility/**/*.ts',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format message:compatibility/out.ndjson',
].join(' ')

module.exports = {
  default: common,
  cck,
}
