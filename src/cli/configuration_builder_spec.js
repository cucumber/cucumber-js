import {promisify} from 'bluebird'
import ConfigurationBuilder from './configuration_builder'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

describe('Configuration', function() {
  beforeEach(async function() {
    this.tmpDir = await promisify(tmp.dir)({unsafeCleanup: true})
    await promisify(fsExtra.mkdirp)(path.join(this.tmpDir, 'features'))
    this.argv = ['path/to/node', 'path/to/cucumber.js']
    this.configurationOptions = {
      argv: this.argv,
      cwd: this.tmpDir
    }
  })

  describe('no argv', function() {
    beforeEach(async function() {
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the default configuration', function() {
      expect(this.result).to.eql({
        featurePaths: [],
        formatOptions: {
          colorsEnabled: true,
          cwd: this.tmpDir
        },
        formats: [{outputTo: '', type: 'pretty'}],
        profiles: [],
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          strict: false,
          worldParameters: {}
        },
        scenarioFilterOptions: {
          cwd: this.tmpDir,
          featurePaths: ['features'],
          names: [],
          tagExpression: ''
        },
        supportCodePaths: []
      })
    })
  })
})
