var scenarioExectionSteps = function() {
  var Given  = When = Then = this.defineStep;
  var World  = require('./cucumber_world').World;
  this.World = World;


  Then(/^(?:only the first|the) scenario is executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(1);
    callback();
  });

  Then(/^only the first two scenarios are executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(1, 2);
    callback();
  });

  Then(/^only the third scenario is executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(3);
    callback();
  });

  Then(/^only the second, third and fourth scenarios are executed$/, function(callback) {
    this.assertExecutedNumberedScenarios(2, 3, 4);
    callback();
  });
};
module.exports = scenarioExectionSteps;
