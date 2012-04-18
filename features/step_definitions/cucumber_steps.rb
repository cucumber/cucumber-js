# This file contains step definitions which are relevant to
# Cucumber.js feature suite only.

Given /^a mapping written in CoffeeScript$/ do
  write_coffee_script_definition_file
end

Given /^a mapping with a string-based pattern$/ do
  write_string_based_pattern_mapping
end

Given /^a mapping with a string-based pattern and parameters$/ do
  write_string_based_pattern_mapping_with_parameters
end

Given /^the step "([^"]*)" has an asynchronous pending mapping$/ do |step_name|
  write_asynchronous_pending_mapping(step_name)
end

Given /^the step "([^"]*)" has a mapping asynchronously failing with the message "([^"]*)"$/ do |step_name, message|
  write_asynchronously_failing_mapping_with_message(step_name, message)
end

Given /^a custom World constructor calling back with an explicit object$/ do
  write_custom_world_constructor_calling_back_with_explicit_object
end

Given /^an around hook tagged with "([^"]*)"$/ do |tag|
  write_passing_hook :type => "around", :tags => [tag], :log_cycle_event_as => "hook"
end

When /^Cucumber executes a scenario using that mapping$/ do
  write_feature <<-EOF
Feature:
  Scenario:
    Given a mapping
EOF
  run_feature
end

When /^Cucumber executes a scenario that passes arguments to that mapping$/ do
  @mapping_arguments = [5, "cucumbers in perfect state"]
  write_feature <<-EOF
Feature:
  Scenario:
    Given a mapping with #{@mapping_arguments[0]} "#{@mapping_arguments[1]}"
EOF
  run_feature
end

When /^Cucumber executes a scenario that calls a function on the explicit World object$/ do
  write_mapping_calling_world_function("I call the explicit world object function")
  write_feature <<-EOF
Feature:
  Scenario:
    When I call the explicit world object function
EOF
  run_feature
end

Then /^the mapping is run$/ do
  assert_passed "a mapping"
end

Then /^the mapping receives the arguments$/ do
  assert_passed_with_arguments "a mapping", @mapping_arguments
end

Then /^the explicit World object function should have been called$/ do
  assert_explicit_world_object_function_called
end

Then /^I see the version of Cucumber$/ do
  assert_matching_output "\\d+\\.\\d+\\.\\d+\\n", all_output
  assert_success true
end

Then /^I see the help of Cucumber$/ do
  assert_partial_output "Usage: cucumber.js ", all_output
  assert_success true
end
