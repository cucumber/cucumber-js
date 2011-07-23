var PendingStepException = function PendingStepException(reason) {
  if (!(this instanceof PendingStepException))
    return new PendingStepException(reason);
};
module.exports = PendingStepException;
