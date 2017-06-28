import { promisify } from 'bluebird'
import fs from 'mz/fs'
import path from 'path'
import PathExpander from './path_expander'
import tmp from 'tmp'

describe('PathExpander', function() {
  describe('expandPathsWithExtensions', function() {
    beforeEach(async function() {
      this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
      this.pathExpander = new PathExpander(this.tmpDir)
    })

    describe('with a file', function() {
      beforeEach(async function() {
        await fs.writeFile(path.join(this.tmpDir, 'a.ext'), 'content')
        this.results = await this.pathExpander.expandPathsWithExtensions(
          ['a.ext'],
          ['ext']
        )
      })

      it('returns the file', async function() {
        expect(this.results).to.eql([path.join(this.tmpDir, 'a.ext')])
      })
    })

    describe('with a folder', function() {
      beforeEach(async function() {
        this.subdirectoryPath = path.join(this.tmpDir, 'subdirectory')
        await fs.mkdir(this.subdirectoryPath)
      })

      describe('no files with the extension', function() {
        beforeEach(async function() {
          this.results = await this.pathExpander.expandPathsWithExtensions(
            ['subdirectory'],
            ['ext']
          )
        })

        it('returns an empty array', function() {
          expect(this.results).to.eql([])
        })
      })

      describe('child file with the extension', function() {
        beforeEach(async function() {
          await fs.writeFile(
            path.join(this.subdirectoryPath, 'a.ext'),
            'content'
          )
          this.results = await this.pathExpander.expandPathsWithExtensions(
            ['subdirectory'],
            ['ext']
          )
        })

        it('returns the file', async function() {
          expect(this.results).to.eql([
            path.join(this.subdirectoryPath, 'a.ext')
          ])
        })
      })

      describe('nested child file with the extension', function() {
        beforeEach(async function() {
          this.nestedSubdirectoryPath = path.join(
            this.subdirectoryPath,
            'nested-subdirectory'
          )
          await fs.mkdir(this.nestedSubdirectoryPath)
          await fs.writeFile(
            path.join(this.nestedSubdirectoryPath, 'a.ext'),
            'content'
          )
          this.results = await this.pathExpander.expandPathsWithExtensions(
            ['subdirectory'],
            ['ext']
          )
        })

        it('returns the file', async function() {
          expect(this.results).to.eql([
            path.join(this.nestedSubdirectoryPath, 'a.ext')
          ])
        })
      })
    })
  })
})
