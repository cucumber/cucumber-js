module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require features/**/*.ts',
    `--format progress-bar`,
    '--format rerun:@rerun.txt',
    '--format usage:reports/usage.txt',
    '--format message:reports/messages.ndjson',
    '--format html:reports/html-formatter.html',
    '--retry 2',
    '--retry-tag-filter @flaky',
    '--publish-quiet',
  ].join(' '),
}
