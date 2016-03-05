var ProjectInitializer = {
  createSaneDefaultProject: function createSaneDefaultProject() { 
    var fsExtra = require('fs-extra');
    var path = require('path');
    var cwd = process.cwd(); 
    fsExtra.mkdirsSync(path.join(cwd, 'features', 'support'));
    fsExtra.mkdirsSync(path.join(cwd, 'features', 'step_definitions'));
    process.exit(0);
  }
};
module.exports = ProjectInitializer;