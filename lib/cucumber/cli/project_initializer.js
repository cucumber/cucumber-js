var ProjectInitializer = {
  createDefaultProject: function createDefaultProject() { 
    var fsExtra = require('fs-extra');
    var path = require('path');
    var cwd = process.cwd(); 
    fsExtra.mkdirsSync(path.join(cwd, 'features', 'support'));
    fsExtra.mkdirsSync(path.join(cwd, 'features', 'step_definitions'));
  }
};
module.exports = ProjectInitializer;