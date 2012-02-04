var RegExp = {
  escapeString: function escapeString(string) {
    var escaped = string.replace(RegExp.ESCAPE_PATTERN, RegExp.ESCAPE_REPLACEMENT);
    return escaped;
  }
};

RegExp.ESCAPE_PATTERN     = /[-[\]{}()*+?.\\^$|#\n\/]/g;
RegExp.ESCAPE_REPLACEMENT = "\\$&";
module.exports = RegExp;
