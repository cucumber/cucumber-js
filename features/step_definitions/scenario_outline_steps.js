var scenario_outline_steps = function() {
	var Given  = When = Then = this.defineStep;
	var World  = require('./cucumber_world').World;
	this.World = World;

	this.When(/^a ([^"]*) step$/, function (some, callback) {         
	  callback();                                           
	});                                                             
	                                                                
	this.Then(/^i get ([^"]*)$/, function (result, callback) {        
	  callback();                                           
	});                            
}

module.exports = scenario_outline_steps;