var stepDefinitionSnippetsSteps = function() {
 var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;

  this.Then(/^a "([^"]*)" step definition snippet for \/\^I am a happy veggie \\\\o\\\/\$\/ is suggested$/, function (arg1, callback) {
    // express the regexp above with the code you wish you had
    callback.pending();
  });

  this.Then(/^a "([^"]*)" step definition snippet for \/\^I type \\\-\\\[\\\]\\\{\\\}\\\(\\\)\\\*\\\+\\\?\\\.\\\\\\\^\\\$\\\|\\\#\\\/\$\/ is suggested$/, function (arg1, callback) {
    // express the regexp above with the code you wish you had
    callback.pending();
  });

  this.Then(/^a "([^"]*)" step definition snippet for \/\^I have \(\\d\+\) "([^"]*)"\]\*\)" cucumbers\$\/ with (\d+) parameters is suggested$/, function (arg1, arg2, arg3, callback) {
    // express the regexp above with the code you wish you had
    callback.pending();
  });

  this.Then(/^a "([^"]*)" step definition snippet for \/\^I have some "([^"]*)"\]\*\)"([^"]*)"\(\[\^"([^"]*)" and "([^"]*)"\]\*\)" cucumbers\$\/ with (\d+) parameters is suggested$/, function (arg1, arg2, arg3, arg4, arg5, arg6, callback) {
    // express the regexp above with the code you wish you had
    callback.pending();
  });

  this.Then(/^a "([^"]*)" step definition snippet for \/\^I have "([^"]*)" cucumbers\$\/ with (\d+) parameters is suggested$/, function (arg1, arg2, arg3, callback) {
    callback.pending();
  });

  this.Then(/^a "([^"]*)" example step definition snippet for \/\^I have "([^"]*)" cucumbers\$\/ with (\d+) parameters is suggested$/, function (arg1, arg2, arg3, callback) {
    this.assertEqual(arg1, "Given");
    this.assertEqual(arg2,'(.*)');
    this.assertEqual(arg3,"1");
    callback();
  });
}

module.exports = stepDefinitionSnippetsSteps;