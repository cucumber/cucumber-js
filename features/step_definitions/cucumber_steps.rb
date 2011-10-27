# This file contains step definitions which are relevant to
# Cucumber.js feature suite only.

Given /^a mapping written in CoffeeScript$/ do
  write_coffee_script_definition_file
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

Given /^a passing before hook$/ do
  append_support_code <<-EOF
this.Before(function(callback) {
  this.calls = ["Before"];
  callback();
});
EOF
end

Given /^a passing after hook$/ do
  append_support_code <<-EOF
this.After(function(callback) {
  this.calls.push("After");
  console.log(this.calls.join(","));
  callback();
});
EOF
end

When /^Cucumber executes a scenario$/ do
  append_step_definition("Cucumber executes a step definition", "this.calls.push('Step');\ncallback();")
  scenario_with_steps "A scenario", "Given Cucumber executes a step definition\n"
  run_feature
end

Then /^the (after|before) hook is fired (?:after|before) the scenario$/ do |type|
  assert_partial_output("Before,Step,After", all_output)
end
