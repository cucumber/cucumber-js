# FIXME: Rename to CucumberJsMappings?
module CucumberJsMappings
  STEP_DEFINITIONS_FILE = "features/step_definitions/cucumber_steps.js"
  FEATURE_FILE          = "features/a_feature.feature"

  def features_dir
    'features'
  end

  def run_scenario(scenario_name)
    # FIXME: do not run the whole feature but only the scenario:
    # run_simple "#{cucumber_bin} #{FEATURE_FILE} --name '#{scenario_name}'", false
    append_to_file(STEP_DEFINITIONS_FILE, "};\nmodule.exports = stepDefinitions;")
    run_simple "#{cucumber_bin} #{FEATURE_FILE} #{STEP_DEFINITIONS_FILE}", false
  end

  def run_feature
    run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
  end

  def cucumber_bin
    File.expand_path(File.dirname(__FILE__) + '/../../cucumber.js')
  end

  def write_passing_mapping(step_name)
    append_step_definition(step_name, "// no-op, pass gently")
  end

  def write_pending_mapping(step_name)
    append_step_definition(step_name, "callback.pending();")
  end

  def write_failing_mapping(step_name)
    append_step_definition(step_name, "throw('Boom!');")
  end

  def write_calculator_code
    code = <<-EOF
  // http://en.wikipedia.org/wiki/Reverse_Polish_notation
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
EOF
    append_support_code(code)
  end

  def write_mappings_for_calculator
    append_support_code <<-EOC
var calc;

function isNumberWithinRangeOfValue(number, range, value) {
  var lowerBound = value - range;
  var upperBound = value + range;
  withinLowerBound = number > lowerBound;
  withinUpperBound = number < upperBound;
  return (withinLowerBound && withinUpperBound);
}

Given(/^a calculator$/, function(callback) {
  calc = RpnCalculator();
  callback();
});

When(/^the calculator computes PI$/, function(callback) {
  calc.pi();
  callback();
});

When(/^the calculator adds up ([\\d\\.]+) and ([\\d\\.]+)$/, function(n1, n2, callback) {
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
  numbers     = numbers.split("\\n");
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
    throw("Expected " + Math.PI + " (PI), got " + value);
  callback();
});

Then(/^the calculator returns "([^"]*)"$/, function(expected_number, callback) {
  var value = calc.value();
  if (!isNumberWithinRangeOfValue(value, 0.00001, parseFloat(expected_number)))
    throw("Expected calculator to return a value within 0.00001 of " + expected_number + ", got " + value);
  callback();
});

Then(/^the calculator does not return ([\\d\\.]+)$/, function(unexpected_number, callback) {
  var value = calc.value();
  if (isNumberWithinRangeOfValue(value, 0.00001, parseFloat(unexpected_number)))
    throw("Expected calculator to not return a value within 0.00001 of " + unexpected_number + ", got " + value);
  callback();
});
EOC
  end

  def assert_passing_scenario
    assert_partial_output("1 scenario (1 passed)", all_output)
    assert_success true
  end

  def assert_failing_scenario
    assert_partial_output("1 scenario (1 failed)", all_output)
    assert_success false
  end

  def assert_pending_scenario
    assert_partial_output("1 scenario (1 pending)", all_output)
    assert_success true
  end

  def assert_undefined_scenario
    assert_partial_output("1 scenario (1 undefined)", all_output)
    assert_success true
  end

  def failed_output
    "failed"
  end

  protected

  def append_step_definition(step_name, code)
    indented_code = ""
    code.each_line { |line| indented_code += "  #{line}" }
    indented_code.rstrip!
    append_support_code(<<-EOF)
  Given(/#{step_name}/, function(callback) {
    fs.writeFileSync("#{step_file(step_name)}", "");
#{indented_code}
    callback();
  });
EOF
  end

  def append_support_code(code)
    @mapping_count ||= 0
    if @mapping_count == 0
      step_definition = "var fs = require('fs');\nvar stepDefinitions = function() {\n"
    else
      step_definition = "\n"
    end
    @mapping_count += 1
    step_definition += code
    append_to_file(STEP_DEFINITIONS_FILE, step_definition)
  end
end

World(CucumberJsMappings)
