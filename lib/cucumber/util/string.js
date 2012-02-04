var String = {
  count: function count(hayStack, needle) {
    var splitHayStack = hayStack.split(needle);
    return splitHayStack.length - 1;
  }
};
module.exports = String;
