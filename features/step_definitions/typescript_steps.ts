import {defineSupportCode, StepDefinitions} from '../../src/typings/cucumber';

defineSupportCode(function(stepDef:StepDefinitions){
    stepDef.Given("Given a typescript feature", () => {
        console.log("Given works");
    });
});
