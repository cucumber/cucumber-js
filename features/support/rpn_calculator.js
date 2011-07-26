var RpnCalculator = function RpnCalculator() {
  var stack = [];

  function x() { return stack.splice(-2, 1)[0]; }
  function y() { return stack.pop(); }

  var self = {
    push: function push(arg) {
      if (arg == '+')
        self.push(x() + y());
      else if (arg == '-')
        self.push(x() - y());
      else if (arg == '*')
        self.push(x() * y());
      else if (arg == '/')
        self.push(x() / y());
      else
        stack.push(parseFloat(arg));
    },

    pi: function pi() {
      self.push(Math.PI);
    },

    value: function value() {
      return stack[stack.length-1];
    }
  };
  return self;
};
module.exports = RpnCalculator;
