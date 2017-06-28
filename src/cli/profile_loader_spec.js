import { promisify } from 'bluebird'
import fs from 'mz/fs'
import path from 'path'
import ProfileLoader from './profile_loader'
import tmp from 'tmp'

describe('ProfileLoader', function() {
  describe('getArgv', function() {
    beforeEach(async function() {
      this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
      this.profileLoader = new ProfileLoader(this.tmpDir)
    })

    describe('with no identifiers', function() {
      describe('no definition file', function() {
        it('returns an empty array', async function() {
          const result = await this.profileLoader.getArgv([])
          expect(result).to.eql([])
        })
      })

      describe('with definition file', function() {
        describe('with a default', function() {
          beforeEach(async function() {
            const fileContent = 'module.exports = {default: "--opt1 --opt2"}'
            await fs.writeFile(
              path.join(this.tmpDir, 'cucumber.js'),
              fileContent
            )
          })

          it('returns the argv for the default profile', async function() {
            const result = await this.profileLoader.getArgv([])
            expect(result).to.eql(['--opt1', '--opt2'])
          })
        })

        describe('without a default', function() {
          beforeEach(async function() {
            const fileContent = 'module.exports = {profile1: "--opt1 --opt2"}'
            await fs.writeFile(
              path.join(this.tmpDir, 'cucumber.js'),
              fileContent
            )
          })

          it('returns an empty array', async function() {
            const result = await this.profileLoader.getArgv([])
            expect(result).to.eql([])
          })
        })
      })
    })

    describe('with identifiers', function() {
      describe('no definition file', function() {
        it('throws', async function() {
          let thrown = false
          try {
            await this.profileLoader.getArgv(['profile1'])
          } catch (error) {
            thrown = true
            expect(error.message).to.eql('Undefined profile: profile1')
          }
          expect(thrown).to.be.true
        })
      })

      describe('with definition file', function() {
        beforeEach(async function() {
          const fileContent =
            'module.exports = {\n' +
            '  profile1: "--opt1 --opt2",\n' +
            '  profile2: "--opt3 \'some value\'"\n' +
            '}'
          await fs.writeFile(path.join(this.tmpDir, 'cucumber.js'), fileContent)
        })

        describe('profile is defined', function() {
          it('returns the argv for the given profile', async function() {
            const result = await this.profileLoader.getArgv(['profile1'])
            expect(result).to.eql(['--opt1', '--opt2'])
          })
        })

        describe('profile is defined and contains quoted string', function() {
          it('returns the argv for the given profile', async function() {
            const result = await this.profileLoader.getArgv(['profile2'])
            expect(result).to.eql(['--opt3', 'some value'])
          })
        })

        describe('profile is not defined', function() {
          it('throws', async function() {
            let thrown = false
            try {
              await this.profileLoader.getArgv(['profile3'])
            } catch (error) {
              thrown = true
              expect(error.message).to.eql('Undefined profile: profile3')
            }
            expect(thrown).to.be.true
          })
        })
      })
    })
  })
})
