var stepDefinitionSnippetsSteps = function() {
 var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;

  this.Then(/^a "([^"]*)" example step definition snippet for \/\^I have "([^"]*)" cucumbers\$\/ with (\d+) parameters is suggested$/, function (stepName, snippetParameter, paramCount, callback) {
    this.assertEqual(stepName, "Given");
    this.assertEqual(snippetParameter,'(.*)');
    this.assertEqual(paramCount,"1");
    callback();
  });
}

module.exports = stepDefinitionSnippetsSteps;