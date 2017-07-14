import { promisify } from 'bluebird'
import fs from 'mz/fs'
import { getFeatures } from './helpers'
import tmp from 'tmp'
import path from 'path'

describe('helpers', function() {
  describe('getFeatures', function() {
    beforeEach(async function() {
      this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
      this.tmpFile = path.join(this.tmpDir, 'a.feature')
    })

    describe('empty feature', function() {
      beforeEach(async function() {
        await fs.writeFile(this.tmpFile, '')
        this.result = await getFeatures({
          cwd: this.tmpDir,
          featurePaths: [this.tmpFile],
          scenarioFilter: createMock({ matches: true })
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.have.lengthOf(0)
      })
    })

    describe('feature without matching scenarios', function() {
      beforeEach(async function() {
        await fs.writeFile(
          this.tmpFile,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await getFeatures({
          cwd: this.tmpDir,
          featurePaths: [this.tmpFile],
          scenarioFilter: createMock({ matches: false })
        })
      })

      it('returns an empty array', function() {
        expect(this.result).to.have.lengthOf(0)
      })
    })

    describe('feature with matching scenarios', function() {
      beforeEach(async function() {
        await fs.writeFile(
          this.tmpFile,
          'Feature: a\nScenario: b\nGiven a step'
        )
        this.result = await getFeatures({
          cwd: this.tmpDir,
          featurePaths: [this.tmpFile],
          scenarioFilter: createMock({ matches: true })
        })
      })

      it('returns the feature', function() {
        expect(this.result).to.have.lengthOf(1)
      })
    })
  })
})
