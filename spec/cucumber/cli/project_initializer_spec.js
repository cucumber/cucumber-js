require('../../support/spec_helper');

describe('Cucumber.Cli.ProjectInitializer', function () {
  describe('createSaneDefaultProject()', function () {
    var Cucumber = requireLib('cucumber');  
    var fsExtra = require('fs-extra'); 
    
    beforeEach(function () {
       spyOn(fsExtra, 'mkdirsSync');
       process.cwd = createSpy("fake cwd").and.returnValue("/tmp");
       process.exit = createSpy("fake exit").and.callFake(function() {});
    });
      
    it("creates the features/support directory", function () {
        Cucumber.Cli.ProjectInitializer.createSaneDefaultProject();
        expect(fsExtra.mkdirsSync).toHaveBeenCalledWith('/tmp/features/support');
    });
    
    it("creates the features/step_definitions directory", function () {
        Cucumber.Cli.ProjectInitializer.createSaneDefaultProject();
        expect(fsExtra.mkdirsSync).toHaveBeenCalledWith('/tmp/features/step_definitions'); 
    }); 
  });
});