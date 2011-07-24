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

  # def run_feature
  #   run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
  # end

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
          stack.push(parseInt(arg));
      },

      pi: function pi() {
        return Math.PI;
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

#   def write_mappings_for_calculator
#     write_file("features/support/env.rb", "$LOAD_PATH.unshift(File.dirname(__FILE__) + '/../../lib')\n")
#     mapping_code = <<-EOF
# require 'rpn_calculator'

# Given /^a calculator$/ do
#   @calc = RpnCalculator.new
# end

# When /^the calculator computes PI$/ do
#   @calc.PI
# end

# When /^the calculator adds up ([\\d\\.]+) and ([\\d\\.]+)$/ do |n1, n2|
#   @calc.push(n1.to_f)
#   @calc.push(n2.to_f)
#   @calc.push('+')
# end

# When /^the calculator adds up "([^"]*)" and "([^"]*)"$/ do |n1, n2|
#   @calc.push(n1.to_i)
#   @calc.push(n2.to_i)
#   @calc.push('+')
# end

# When /^the calculator adds up "([^"]*)", "([^"]*)" and "([^"]*)"$/ do |n1, n2, n3|
#   @calc.push(n1.to_i)
#   @calc.push(n2.to_i)
#   @calc.push(n3.to_i)
#   @calc.push('+')
#   @calc.push('+')
# end

# When /^the calculator adds up the following numbers:$/ do |numbers|
#   pushed = 0
#   numbers.split("\\n").each do |n|
#     @calc.push(n.to_i)
#     pushed +=1
#     @calc.push('+') if pushed > 1
#   end
# end

# Then /^the calculator returns PI$/ do
#   @calc.value.to_f.should be_within(0.00001).of(Math::PI)
# end

# Then /^the calculator returns "([^"]*)"$/ do |expected|
#   @calc.value.to_f.should be_within(0.00001).of(expected.to_f)
# end

# Then /^the calculator does not return ([\\d\\.]+)$/ do |unexpected|
#   @calc.value.to_f.should_not be_within(0.00001).of(unexpected.to_f)
# end

# EOF
#     write_file("features/step_definitions/calculator_mappings.rb", mapping_code)
#   end

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

#   def failed_output
#     "failed"
#   end

  def append_step_definition(step_name, code)
    append_support_code(<<-EOF)
  Given(/#{step_name}/, function(callback){
    fs.writeFileSync("#{step_file(step_name)}", "");
    #{code}
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
