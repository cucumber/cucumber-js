# This file contains step definitions which are relevant to
# Cucumber.js feature suite only.

Given /^a mapping written in CoffeeScript$/ do
  write_coffee_script_definition_file
end

# TODO: encapsulate and move to cucumber-features
Given /^a passing (before|after) hook$/ do |hook_type|
  define_hook = hook_type.capitalize
  append_support_code <<-EOF
this.#{define_hook}(function(callback) {
  this.logCycleEvent('#{hook_type}');
  callback();
});
EOF
end

When /^Cucumber executes a scenario using that mapping$/ do
  write_feature <<-EOF
Feature:
  Scenario:
    Given a mapping
EOF
  run_feature
end

# TODO: encapsulate and move to cucumber-features
When /^Cucumber executes a scenario$/ do
  append_step_definition("a step", "this.logCycleEvent('step');\ncallback();")
  scenario_with_steps "A scenario", "Given Cucumber executes a step definition"
  run_feature
end

# TODO: encapsulate and move to cucumber-features
Then /^the (after|before) hook is fired (?:after|before) the scenario$/ do |hook_type|
  expected_string = (hook_type == 'before' ? 'before -> step' : 'step -> after')
  check_file_content(CucumberJsMappings::CYCLE_LOG_FILE, expected_string, true)
end

# TODO: encapsulate and move to cucumber-features
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
