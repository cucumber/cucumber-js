var Status = {};

Status.FAILED = 'failed';
Status.PENDING = 'pending';
Status.PASSED = 'passed';
Status.SKIPPED = 'skipped';
Status.UNDEFINED = 'undefined';

Status.ALL = [
  Status.FAILED,
  Status.PENDING,
  Status.PASSED,
  Status.SKIPPED,
  Status.UNDEFINED
];

module.exports = Status;
