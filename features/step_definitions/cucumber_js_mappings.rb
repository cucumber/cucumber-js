module CucumberJsMappings
  STEP_DEFINITIONS_FILE                   = "features/step_definitions/cucumber_steps.js"
  COFFEE_SCRIPT_DEFINITIONS_FILE          = "features/step_definitions/cucumber_steps.coffee"
  POGO_SCRIPT_DEFINITIONS_FILE            = "features/step_definitions/cucumber_steps.pogo"
  FEATURE_FILE                            = "features/a_feature.feature"
  WORLD_VARIABLE_LOG_FILE                 = "world_variable.log"
  WORLD_FUNCTION_LOG_FILE                 = "world_function.log"
  EXPLICIT_WORLD_OBJECT_FUNCTION_LOG_FILE = "world_function.log";
  DATA_TABLE_LOG_FILE                     = "data_table.log"
  CYCLE_LOG_FILE                          = "cycle.log"
  CYCLE_SEQUENCE_SEPARATOR                = " -> "

  attr_accessor :support_code

  def features_dir
    'features'
  end

  def run_feature
    write_main_step_definitions_file
    run_simple "#{cucumber_bin} #{FEATURE_FILE}", false
  end

  def run_feature_with_tags *tag_groups
    write_main_step_definitions_file
    command = "#{cucumber_bin} #{FEATURE_FILE}"
    tag_groups.each do |tag_group|
      command += " --tags #{tag_group}"
    end
    run_simple command, false
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

  def write_asynchronous_pending_mapping(step_name)
    append_step_definition(step_name, "setTimeout(callback.pending, 10);")
  end

  def write_failing_mapping(step_name)
    write_failing_mapping_with_message(step_name, "I was supposed to fail.")
  end

  def write_asynchronously_failing_mapping(step_name)
    write_asynchronously_failing_mapping_with_message(step_name, "I was supposed to fail.")
  end

  def write_failing_mapping_with_message(step_name, message)
    append_step_definition(step_name, "throw(new Error('#{message}'));")
  end

  def write_asynchronously_failing_mapping_with_message(step_name, message)
    append_step_definition(step_name, "setTimeout(function () { callback.fail('#{message}');}, 10);")
  end

  def write_asynchronously_failing_mapping_through_exception_with_message(step_name, message)
    append_step_definition(step_name, "setTimeout(function () { throw new Error('#{message}');}, 10);")
  end

  def write_failing_mapping_through_nodejs_callback(step_name)
    append_step_definition(step_name, "callback(new Error('#fail'));")
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
this.someFunction (); callback();
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

  def write_mapping_receiving_data_table_as_headless_row_array(step_name)
    body = <<-EOF
var dataTableHashes = dataTable.rows();
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
    append_support_code "this.World = function CustomWorld(callback) { callback(); };\n"
  end

  def write_custom_world_constructor_calling_back_with_explicit_object
    append_support_code "this.World = function CustomWorldConstructor(callback) {
  callback({
    someFunction: function () { fs.writeFileSync(\"#{EXPLICIT_WORLD_OBJECT_FUNCTION_LOG_FILE}\", \"\")}
  });
};\n"
  end

  def write_world_function
    append_support_code <<-EOF
this.World.prototype.someFunction = function () {
  fs.writeFileSync("#{WORLD_FUNCTION_LOG_FILE}", "");
};
EOF
  end

  def write_passing_hook options = {}
    log_string = options[:log_cycle_event_as]
    if options[:type]
      hook_type  = options[:type]
      log_string ||= hook_type
    else
      hook_type  = "before"
      log_string ||= "hook"
    end
    tags        = options[:tags] || []
    provide_cycle_logging_facilities
    define_hook = hook_type.capitalize
    params      = tags.any? ? "'#{tags.join("', '")}', " : ""

    if hook_type == "around"
      append_support_code <<-EOF
this.#{define_hook}(#{params}function (scenario, runScenario) {
  this.logCycleEvent('#{log_string}-pre');
  runScenario(function (callback) {
    this.logCycleEvent('#{log_string}-post');
    callback();
  });
});
EOF
    else
      append_support_code <<-EOF
this.#{define_hook}(#{params}function (scenario, callback) {
  this.logCycleEvent('#{log_string}');
  callback();
});
EOF
    end
  end

  def write_scenario options = {}
    tags = options[:with_tags] || []

    @next_step_count ||= 0
    step_name = nth_step_name @next_step_count += 1
    tags_definition = tags.any? ? "\n  #{tags.join(' ')}" : ""
    provide_cycle_logging_facilities
    append_step_definition(step_name, "this.logCycleEvent('#{step_name}');\ncallback();")
    append_to_feature <<-EOF
#{tags_definition}
  Scenario: scenario #{"tagged with " + tags.join(', ') if tags.any?}
    Given #{step_name}
EOF
  end

  def provide_cycle_logging_facilities
    unless @cycle_logging_facilities_ready
      append_support_code <<-EOF
this.World.prototype.logCycleEvent = function logCycleEvent(name) {
  fd = fs.openSync('#{CYCLE_LOG_FILE}', 'a');
  fs.writeSync(fd, "#{CYCLE_SEQUENCE_SEPARATOR}" + name, null);
  fs.closeSync(fd);
};
EOF
      @cycle_logging_facilities_ready = true
    end
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

  def assert_explicit_world_object_function_called
    check_file_presence [EXPLICIT_WORLD_OBJECT_FUNCTION_LOG_FILE], true
  end

  def assert_cycle_sequence *args
    expected_string = args.join CYCLE_SEQUENCE_SEPARATOR
    check_file_content(CucumberJsMappings::CYCLE_LOG_FILE, expected_string, true)
  end

  def assert_cycle_sequence_excluding *args
    args.each do |unexpected_string|
      check_file_content(CucumberJsMappings::CYCLE_LOG_FILE, unexpected_string, false)
    end
  end

  def assert_complete_cycle_sequence *args
    expected_string = "#{CYCLE_SEQUENCE_SEPARATOR}#{args.join(CYCLE_SEQUENCE_SEPARATOR)}"
    check_exact_file_content(CucumberJsMappings::CYCLE_LOG_FILE, expected_string)
  end

  def assert_data_table_equals_json(json)
    prep_for_fs_check do
      log_file_contents = IO.read(DATA_TABLE_LOG_FILE)
      actual_array      = JSON.parse(log_file_contents)
      expected_array    = JSON.parse(json)
      actual_array.should == expected_array
    end
  end

  def assert_suggested_step_definition_snippet(stepdef_keyword, stepdef_pattern, parameter_count = 0, doc_string = false, data_table = false)
    parameter_count ||= 0
    params = Array.new(parameter_count) { |i| "arg#{i+1}" }
    params << "string" if doc_string
    params << "table"  if data_table
    params << "callback"
    params = params.join ", "
    expected_snippet = <<-EOF
this.#{stepdef_keyword}(/#{stepdef_pattern}/, function (#{params}) {
  // express the regexp above with the code you wish you had
  callback.pending();
});
EOF
    assert_partial_output(expected_snippet, all_output)
  end

  def assert_executed_scenarios *scenario_offsets
    sequence = scenario_offsets.inject([]) do |sequence, scenario_offset|
      sequence << nth_step_name(scenario_offset)
    end
    assert_complete_cycle_sequence *sequence
  end

  def assert_passed_with_arguments(pattern, arguments)
    raise "#{pattern} did not pass" unless pattern_exists?(pattern)
    check_exact_file_content step_file(pattern), arguments.join("\n")
  end

  def assert_json_output(expected)
    expected.gsub!(/<current-directory>/, File.join(Dir.pwd, current_dir))
    expected = JSON(expected)
    actual   = JSON(all_output)

    neutralise_variable_values_in_json expected
    neutralise_variable_values_in_json actual

    expected = expected.to_s
    actual   = actual.to_s
    actual.should == expected
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
this.defineStep(/#{step_name}/, function (#{params_string}) {
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
    append_to_file(STEP_DEFINITIONS_FILE, "var fs = require('fs');\nvar stepDefinitions = function () {\n");
    append_to_file(STEP_DEFINITIONS_FILE, support_code);
    append_to_file(STEP_DEFINITIONS_FILE, "};\nmodule.exports = stepDefinitions;")
  end

  def write_coffee_script_definition_file
    @mapping_name = "a CoffeeScript mapping"
    append_to_file COFFEE_SCRIPT_DEFINITIONS_FILE, <<-EOF
fs = require('fs')
stepDefinitions = () ->
  this.defineStep(/^#{@mapping_name}$/, (callback) ->
    fs.writeFileSync('#{step_file(@mapping_name)}', '')
    callback()
  )
module.exports = stepDefinitions
EOF
  end

  def write_pogo_script_definition_file
    @mapping_name = "a PogoScript mapping"
    append_to_file POGO_SCRIPT_DEFINITIONS_FILE, <<-EOF
fs = require('fs')
step definitions () =
    this.define step r/^#{@mapping_name}$/ @(callback)
        fs.write file sync ('#{step_file(@mapping_name)}', '')
        callback()

module.exports = step definitions
EOF
  end

  def write_string_based_pattern_mapping
    @mapping_name = "a mapping + fancy characters"
    append_support_code <<-EOF
this.defineStep("a mapping + fancy characters", function (callback) {
  fs.writeFileSync("#{step_file(@mapping_name)}", "");
  callback();
});
EOF
  end

  def write_string_based_pattern_mapping_with_parameters
    @mapping_name = "a string-based mapping with parameters"
    append_support_code <<-EOF
this.defineStep('a mapping with $word_param "$multi_word_param"', function (p1, p2, callback) {
  fs.writeFileSync("#{step_file(@mapping_name)}", p1 + "\\n" + p2);
  callback();
});
EOF
  end

  def get_file_contents(file_path)
    file_realpath = File.expand_path(file_path, File.dirname(__FILE__))
    File.open(file_realpath, 'rb') do |f|
      f.read
    end
  end

  def nth_step_name n
    "step #{n}"
  end

  def neutralise_variable_values_in_json json
    json.each do |item|
      (item['elements'] || []).each do |element|
        (element['steps'] || []).each do |step|
          if step.include? 'result'
            step['result']['error_message'] = "<error-message>" if step['result'].include? 'error_message'
            step['result']['duration'] = "<duration>" if step['result'].include? 'duration'
          end
        end
      end
    end
  end
end

World(CucumberJsMappings)
