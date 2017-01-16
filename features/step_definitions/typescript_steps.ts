import {defineSupportCode, StepDefinitions} from '../../dist/cucumber';

defineSupportCode(function(stepDef:StepDefinitions){
    stepDef.Given("Given a typescript feature", () => {
        console.log("Given works");
    });
});
