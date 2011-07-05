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

#   def run_feature
#     run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
#   end

  def cucumber_bin
    File.expand_path(File.dirname(__FILE__) + '/../../cucumber.js')
  end

  def write_passing_mapping(step_name)
    @mapping_count ||= 0
    if @mapping_count == 0
      step_definition = "var fs = require('fs');\nvar stepDefinitions = function() {\n"
    else
      step_definition = "\n"
    end
    erb = ERB.new(<<-EOF, nil, '-')
  Given(/<%= step_name -%>/, function(callback){
    fs.writeFileSync("<%= step_file(step_name) %>", "");
    callback();
  });
EOF
    @mapping_count += 1
    step_definition += erb.result(binding)
    append_to_file(STEP_DEFINITIONS_FILE, step_definition)
  end

#   def write_pending_mapping(step_name)
#     erb = ERB.new(<<-EOF, nil, '-')
# Given /<%= step_name -%>/ do
#   # ARUBA_IGNORE_START
#   File.open("<%= step_file(step_name) %>", "w")
#   # ARUBA_IGNORE_END
#   pending
# end

# EOF
#     append_to_file("features/step_definitions/some_stepdefs.rb", erb.result(binding))
#   end

  def write_failing_mapping(step_name)
    @mapping_count ||= 0
    if @mapping_count == 0
      step_definition = "var fs = require('fs');\nvar stepDefinitions = function() {\n"
    else
      step_definition = "\n"
    end
    erb = ERB.new(<<-EOF, nil, '-')
  Given(/<%= step_name -%>/, function(callback){
    fs.writeFileSync("<%= step_file(step_name) %>", "");
    throw "Boom!";
    callback();
  });
EOF
    @mapping_count += 1
    step_definition += erb.result(binding)
    append_to_file(STEP_DEFINITIONS_FILE, step_definition)
  end

#   def write_calculator_code
#         code = <<-EOF
# # http://en.wikipedia.org/wiki/Reverse_Polish_notation
# class RpnCalculator
#   def initialize
#     @stack = []
#   end

#   def push(arg)
#     if(%w{- + * /}.index(arg))
#       y, x = @stack.pop(2)
#       push(x.__send__(arg, y))
#     else
#       @stack.push(arg)
#     end
#   end

#   def PI
#     push(Math::PI)
#   end

#   def value
#     @stack[-1]
#   end
# end
# EOF
#     write_file("lib/rpn_calculator.rb", code)
#   end

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
    assert_partial_output("1 scenario(s) (1 passed)", all_output)
    assert_success true
  end

  def assert_failing_scenario
    assert_partial_output("1 scenario(s) (1 failed)", all_output)
    assert_success false
  end

#   def assert_pending_scenario
#     assert_partial_output("1 scenario (1 pending)", all_output)
#     assert_success true
#   end

#   def assert_undefined_scenario
#     assert_partial_output("1 scenario (1 undefined)", all_output)
#     assert_success true
#   end

#   def failed_output
#     "failed"
#   end
end

World(CucumberJsMappings)
