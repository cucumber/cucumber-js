var calculatorSteps = {};

calculatorSteps.initialize = function(Calculator) {
  if (typeof(Calculator) == 'undefined')
    throw new Error("A Calculator is required");

  var Given = When = Then = this.defineStep;
  var calc;

  function isNumberWithinRangeOfValue(number, range, value) {
    var lowerBound = value - range;
    var upperBound = value + range;
    withinLowerBound = number > lowerBound;
    withinUpperBound = number < upperBound;
    return (withinLowerBound && withinUpperBound);
  }

  Given(/^a calculator$/, function(callback) {
    calc = Calculator();
    callback();
  });

  When(/^the calculator computes PI$/, function(callback) {
    calc.pi();
    callback();
  });

  When(/^the calculator adds up ([\d\.]+) and ([\d\.]+)$/, function(n1, n2, callback) {
    calc.push(n1);
    calc.push(n2);
    calc.push('+');
    callback();
  });

  When(/^the calculator adds up "([^"]*)" and "([^"]*)"$/, function(n1, n2, callback) {
    calc.push(parseInt(n1));
    calc.push(parseInt(n2));
    calc.push('+');
    callback();
  });

  When(/^the calculator adds up "([^"]*)", "([^"]*)" and "([^"]*)"$/, function(n1, n2, n3, callback) {
    calc.push(parseInt(n1));
    calc.push(parseInt(n2));
    calc.push(parseInt(n3));
    calc.push('+');
    calc.push('+');
    callback();
  });

  When(/^the calculator adds up the following numbers:$/, function(numbers, callback) {
    numbers     = numbers.split("\n");
    var len     = numbers.length;
    var operate = false;
    for(var i = 0; i < len; i++) {
      var number = numbers[i];
      calc.push(number);
      operate ? calc.push('+') : operate = true;
    }
    callback();
  });

  Then(/^the calculator returns PI$/, function(callback) {
    var value = calc.value();
    if (!isNumberWithinRangeOfValue(value, 0.00001, Math.PI))
      throw(new Error("Expected " + Math.PI + " (PI), got " + value));
    callback();
  });

  Then(/^the calculator returns "([^"]*)"$/, function(expected_number, callback) {
    var value = calc.value();
    if (!isNumberWithinRangeOfValue(value, 0.00001, parseFloat(expected_number)))
      throw(new Error("Expected calculator to return a value within 0.00001 of " + expected_number + ", got " + value));
    callback();
  });

  Then(/^the calculator does not return ([\d\.]+)$/, function(unexpected_number, callback) {
    var value = calc.value();
    if (isNumberWithinRangeOfValue(value, 0.00001, parseFloat(unexpected_number)))
      throw(new Error("Expected calculator to not return a value within 0.00001 of " + unexpected_number + ", got " + value));
    callback();
  });
};

module.exports = calculatorSteps;
