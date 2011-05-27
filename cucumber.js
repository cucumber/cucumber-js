var fs             = require('fs');
var Cucumber       = require('./lib/cucumber');
var supportCode    = require('./features/step_definitions/cucumber_steps');
var cucumber       = Cucumber(fs.readFileSync(process.ARGV[2]), supportCode);
var simpleListener = Cucumber.Debug.SimpleAstListener({logToConsole: true});
cucumber.attachListener(simpleListener);
cucumber.start(function() {
  /*
    Some "after" messages from the tree walker are still not processed when
    the callback is triggered. It means that post-processing might still
    be on hold on listeners. This is due to
    Cucumber.TreeWalker.broadcastMessagesBeforeAndAfterFunction() using no
    callback and expecting the passed function to handle the possible
    callback.
  
    Fixing this is easy: broadcastMessagesBeforeAndAfterFunction() would
    need a callback and run it AFTER broadcasting "after" messages.
  
    Uncomment the following line to see that behaviour:
  */
  // console.log("Done. But too soon, some dudes haven't finished doing their stuff just yet.");
});
