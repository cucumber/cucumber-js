module CucumberJsMappings
  STEP_DEFINITIONS_FILE = "features/step_definitions/cucumber_steps.js"
  FEATURE_FILE          = "features/a_feature.feature"

  attr_accessor :support_code

  def features_dir
    'features'
  end

  def run_scenario(scenario_name)
    # FIXME: do not run the whole feature but only the scenario:
    # run_simple "#{cucumber_bin} #{FEATURE_FILE} --name '#{scenario_name}'", false
    write_main_step_definitions_file
    run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
  end

  def run_feature
    write_main_step_definitions_file
    run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
  end

  def cucumber_bin
    File.expand_path(File.dirname(__FILE__) + '/../../bin/cucumber.js')
  end

  def write_passing_mapping(step_name)
    append_step_definition(step_name, "// no-op, pass gently\ncallback();")
  end

  def write_pending_mapping(step_name)
    append_step_definition(step_name, "callback.pending();")
  end

  def write_failing_mapping(step_name)
    write_failing_mapping_with_message(step_name, "I was supposed to fail.")
  end

  def write_failing_mapping_with_message(step_name, message)
    append_step_definition(step_name, "throw(new Error('#{message}'));")
  end

  def write_calculator_code
    rpn_calculator_code = get_file_contents('../support/rpn_calculator.js')
    create_dir 'features/support'
    write_file 'features/support/rpn_calculator.js', rpn_calculator_code
  end

  def write_mappings_for_calculator
    calculator_steps = get_file_contents('./calculator_steps.js')
    write_file 'features/step_definitions/calculator_steps.js', calculator_steps
    append_support_code <<-EOF
var RpnCalculator   = require('../support/rpn_calculator');
var calculatorSteps = require('./calculator_steps');
calculatorSteps(RpnCalculator);
EOF
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

  def assert_scenario_reported_as_failing(scenario_name)
    assert_partial_output("# Scenario: #{scenario_name}", all_output)
    assert_success false
  end

  def assert_scenario_not_reported_as_failing(scenario_name)
    assert_no_partial_output("# Scenario: #{scenario_name}", all_output)
  end

  def failed_output
    "failed"
  end

  protected

  def append_step_definition(step_name, code)
    indented_code = indent_code(code).rstrip
    append_support_code <<-EOF
Given(/#{step_name}/, function(callback) {
  fs.writeFileSync("#{step_file(step_name)}", "");
#{indented_code}
});
EOF
  end

  def append_support_code(code)
    @support_code ||= ''
    @support_code += indent_code(code)
  end

  def write_main_step_definitions_file
    append_to_file(STEP_DEFINITIONS_FILE, "var fs = require('fs');\nvar stepDefinitions = function() {\n");
    append_to_file(STEP_DEFINITIONS_FILE, support_code);
    append_to_file(STEP_DEFINITIONS_FILE, "};\nmodule.exports = stepDefinitions;")
  end

  def get_file_contents(file_path)
    file_realpath = File.expand_path(file_path, File.dirname(__FILE__))
    File.open(file_realpath, 'rb') do |f|
      f.read
    end
  end

  def indent_code(code, levels = 1)
    indented_code = ''
    code.each_line { |line| indented_code += "#{'  ' * levels}#{line}" }
    indented_code
  end
end
World(CucumberJsMappings)
