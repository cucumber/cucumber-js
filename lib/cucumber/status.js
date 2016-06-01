var Status = {};

Status.AMBIGUOUS = 'ambiguous';
Status.FAILED = 'failed';
Status.PENDING = 'pending';
Status.PASSED = 'passed';
Status.SKIPPED = 'skipped';
Status.UNDEFINED = 'undefined';

Status.getMapping = function getMapping(initialValue) {
  var statuses = [
    Status.AMBIGUOUS,
    Status.FAILED,
    Status.PASSED,
    Status.PENDING,
    Status.SKIPPED,
    Status.UNDEFINED
  ];
  var counts = {};
  statuses.forEach(function (status) {
    counts[status] = initialValue;
  });
  return counts;
};

module.exports = Status;
