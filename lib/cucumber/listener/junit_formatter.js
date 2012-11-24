var JunitFormatter = function (options) {
  var Cucumber = require('../../cucumber');
  var builder = require('xmlbuilder');

  //var failedScenarioLogBuffer = "";
  //var undefinedStepLogBuffer  = "";
  //var failedStepResults       = Cucumber.Type.Collection();
  var testSuitesStartTime,testSuiteStartTime, testCaseStartTime;
  var testSuites, testSuite, testCase;
  var testSuitesTotalTestCount, testSuiteTotalTestCount;
  var testSuitesErrorTestCount, testSuiteErrorTestCount;
  var testSuitesFailureTestCount, testSuiteFailureTestCount;
  var feature;

  var statsJournal  = Cucumber.Listener.StatsJournal();

  var self = Cucumber.Listener.Formatter(options);

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };
/*
  self.handleStepResultEvent = function handleStepResult(event, callback) {
    console.log('handleStepResultEvent');
    callback();
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult(stepResult) {
    console.log('handleUndefinedStepResult');
  };

  self.handleFailedStepResult = function handleFailedStepResult(stepResult) {
    console.log('handleFailedStepResult');
  };
*/

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    //console.log('handleBeforeScenarioEvent');
    testCaseStartTime = self.getTime();
    callback();
  };


  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    //console.log('handleAfterScenarioEvent');
    self.buildTestCase(event, callback);
  };

  self.handleBeforeFeaturesEvent = function handleBeforeFeaturesEvent(event, callback) {
    //console.log('handleBeforeFeaturesEvent');
    testSuites = builder.create('testsuites');
    testSuitesStartTime = self.getTime();
    testSuitesTotalTestCount = testSuitesErrorTestCount = testSuitesFailureTestCount = 0;

    callback();
  };
  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    //console.log('handleAfterFeaturesEvent');
    // update totals
    testSuites.att('time', self.getTimeDiff(testSuitesStartTime, self.getTime()));
    testSuites.att('tests', testSuitesTotalTestCount);
    testSuites.att('errors', testSuitesErrorTestCount);
    testSuites.att('failures', testSuitesFailureTestCount);

    // log result
    self.logXML();
    callback();
  };
  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    //console.log('handleBeforeFeatureEvent');
    testSuite = testSuites.element('testsuite');
    testSuiteStartTime = self.getTime();
    testSuiteTotalTestCount = testSuiteErrorTestCount = testSuiteFailureTestCount = 0;
    feature  = event.getPayloadItem('feature');

    callback();
  };

  self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
    //console.log('handleAfterFeatureEvent');
    var feature = event.getPayloadItem('feature');
    //console.log(feature.getName());
    testSuite.att('name', feature.getName());
    testSuite.att('time', self.getTimeDiff(testSuiteStartTime, self.getTime()));
    testSuite.att('tests', testSuiteTotalTestCount);
    testSuite.att('errors', testSuiteErrorTestCount);
    testSuite.att('failures', testSuiteFailureTestCount);

    callback();
  };

  self.logXML = function logXML(){
    //console.log('logXML');
    // log results
    self.log(testSuites.end({ pretty: true}));
  };

  self.buildTestCase = function(event, callback){
    scenario = event.getPayloadItem('scenario');

    var testCase = testSuite.element('testcase');

    // set name
    testCase.att('name', scenario.getName());
    // set classname/feature
    testCase.att('classname', feature.getName());
    // set time
    testCase.att('time', self.getTimeDiff(testCaseStartTime, self.getTime()));

    // increment the total counters
    testSuitesTotalTestCount ++;
    testSuiteTotalTestCount ++;

    var name = scenario.getName();
    var uri  = scenario.getUri();
    var line = scenario.getLine();

    //console.log(scenario);
    var text = uri + ":" + line + " # Scenario: " + name + "";
    // handle errors
    if(statsJournal.isCurrentScenarioPending() || statsJournal.isCurrentScenarioUndefined()){

      // increment the error counters
      testSuitesErrorTestCount ++;
      testSuiteErrorTestCount ++;

      // create the error element
      testCase.element('error', {message:"Scenario: "+name+" ERROR"}, text);

    // handle failures
    } else if (statsJournal.isCurrentScenarioFailing()) {

      // increment the failure counters
      testSuitesFailureTestCount ++;
      testSuiteFailureTestCount ++;

      // create the failure element
      testCase.element('failure', {message:"Scenario: "+name+" FAILED"}, text);
    }
    callback();

  };
  self.getTime = function getTime(){
    return (new Date).getTime();
  };
  self.getTimeDiff = function getTimeDiff(before, after){
    return (after - before)/1000;
  };

  return self;
};
module.exports = JunitFormatter;
