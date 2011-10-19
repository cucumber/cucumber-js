module CucumberJsMappings
  STEP_DEFINITIONS_FILE          = "features/step_definitions/cucumber_steps.js"
  COFFEE_SCRIPT_DEFINITIONS_FILE = "features/step_definitions/cucumber_steps.coffee"
  FEATURE_FILE                   = "features/a_feature.feature"
  WORLD_VARIABLE_LOG_FILE        = "world_variable.log"
  WORLD_FUNCTION_LOG_FILE        = "world_function.log"
  DATA_TABLE_LOG_FILE            = "data_table.log"
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

  def write_mapping_incrementing_world_variable_by_value(step_name, increment_value)
    append_step_definition(step_name, "this.variable += #{increment_value}; callback();")
  end

  def write_mapping_logging_world_variable_value(step_name, time = "1")
    step_def = <<-EOF
fs.writeFileSync("#{WORLD_VARIABLE_LOG_FILE}.#{time}", "" + this.variable); callback();
EOF
    append_step_definition(step_name, step_def)
  end

  def write_mapping_calling_world_function(step_name)
    step_def = <<-EOF
this.someFunction(); callback();
EOF
    append_step_definition(step_name, step_def)
  end

  def write_mapping_receiving_data_table_as_raw(step_name)
    body = <<-EOF
var dataTableArray = dataTable.raw();
var dataTableJSON  = JSON.stringify(dataTableArray);
fs.writeFileSync("#{DATA_TABLE_LOG_FILE}", "" + dataTableJSON);
callback();
EOF
    append_step_definition(step_name, body, ["dataTable"])
  end

  def write_mapping_receiving_data_table_as_hashes(step_name)
    body = <<-EOF
var dataTableHashes = dataTable.hashes();
var dataTableJSON   = JSON.stringify(dataTableHashes);
fs.writeFileSync("#{DATA_TABLE_LOG_FILE}", "" + dataTableJSON);
callback();
EOF
    append_step_definition(step_name, body, ["dataTable"])
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
calculatorSteps.initialize.call(this, RpnCalculator);
EOF
  end

  def write_world_variable_with_numeric_value(value)
    append_support_code <<-EOF
this.World.prototype.variable = #{value};
EOF
  end

  def write_custom_world_constructor
    append_support_code "this.World = function CustomWorld() {};"
  end

  def write_world_function
    append_support_code <<-EOF
this.World.prototype.someFunction = function() {
  fs.writeFileSync("#{WORLD_FUNCTION_LOG_FILE}", "");
};
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

  def assert_world_variable_held_value_at_time(value, time)
    check_exact_file_content "#{WORLD_VARIABLE_LOG_FILE}.#{time}", value
  end

  def assert_world_function_called
    check_file_presence [WORLD_FUNCTION_LOG_FILE], true
  end

  def assert_data_table_equals_json(json)
    prep_for_fs_check do
      log_file_contents = IO.read(DATA_TABLE_LOG_FILE)
      actual_array      = JSON.parse(log_file_contents)
      expected_array    = JSON.parse(json)
      actual_array.should == expected_array
    end
  end

  def failed_output
    "failed"
  end

  protected

  def append_step_definition(step_name, code, params = [])
    params.push("callback");
    params_string = params.join(", ")
    indented_code = indent_code(code).rstrip
    append_support_code <<-EOF
this.defineStep(/#{step_name}/, function(#{params_string}) {
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

  def write_coffee_script_definition_file
    append_to_file COFFEE_SCRIPT_DEFINITIONS_FILE, <<-EOF
fs = require('fs')
stepDefinitions = () ->
  this.defineStep(/^a mapping$/, (callback) ->
    fs.writeFileSync('a_mapping.step', '')
    callback()
  )
module.exports = stepDefinitions
EOF
  end

  def get_file_contents(file_path)
    file_realpath = File.expand_path(file_path, File.dirname(__FILE__))
    File.open(file_realpath, 'rb') do |f|
      f.read
    end
  end
end
World(CucumberJsMappings)
