var scenarioOutlineSteps = function() {
	var Given  = When = Then = this.defineStep;
	var World  = require('./cucumber_world').World;
	this.World = World;

	this.When(/^a (.*) step$/, function (some, callback) {
	  this.assertTrue(some === "passing" || some === "failing");
	  callback();
	});

	this.Then(/^i get (.*)$/, function (result, callback) {
		this.assertTrue(result === "passed" || result === "skipped");
   	callback();
	});
}

module.exports = scenarioOutlineSteps;
