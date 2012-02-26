# This file contains step definitions which are relevant to
# Cucumber.js feature suite only.

Given /^a mapping written in CoffeeScript$/ do
  write_coffee_script_definition_file
end

Given /^a custom World constructor calling back without an instance$/ do
  write_world_constructor_not_calling_back_with_instance
end

Given /^the step "([^"]*)" has an asynchronous pending mapping$/ do |step_name|
  write_asynchronous_pending_mapping(step_name)
end

Given /^the step "([^"]*)" has a mapping asynchronously failing with the message "([^"]*)"$/ do |step_name, message|
  write_asynchronously_failing_mapping_with_message(step_name, message)
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

Then /^the mapping is run$/ do
  assert_passed "a mapping"
end

Then /^I see the version of Cucumber$/ do
  assert_matching_output "\\d+\\.\\d+\\.\\d+\\n", all_output
  assert_success true
end

Then /^I see the help of Cucumber$/ do
  assert_partial_output "Usage: cucumber.js ", all_output
  assert_success true
end

Then /^an error about the missing World instance is raised$/ do
  assert_partial_output("World constructor called back without World instance", all_output)
  assert_success false
end
