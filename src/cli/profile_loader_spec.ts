import { describe, it } from 'mocha'
import { expect } from 'chai'
import fs from 'mz/fs'
import path from 'path'
import ProfileLoader from './profile_loader'
import tmp, { DirOptions } from 'tmp'
import { promisify } from 'util'
import { doesHaveValue, valueOrDefault } from '../value_checker'

describe('ProfileLoader', () => {
  describe('getArgv', () => {
    interface TestProfileLoaderOptions {
      definitionsFileContent?: string
      definitionsFileName?: string
      profiles?: string[]
      configOption?: string
    }

    async function testGetArgv(
      opts: TestProfileLoaderOptions = {}
    ): Promise<string[]> {
      const cwd = await promisify<DirOptions, string>(tmp.dir)({
        unsafeCleanup: true,
      })
      const definitionsFileName = opts.definitionsFileName ?? 'cucumber.js'

      if (doesHaveValue(opts.definitionsFileContent)) {
        await fs.writeFile(
          path.join(cwd, definitionsFileName),
          opts.definitionsFileContent
        )
      }

      const profileLoader = new ProfileLoader(cwd)
      return await profileLoader.getArgv(
        valueOrDefault(opts.profiles, []),
        opts.configOption
      )
    }

    describe('with no identifiers', () => {
      describe('no definition file', () => {
        it('returns an empty array', async function () {
          // Arrange

          // Act
          const result = await testGetArgv()

          // Assert
          expect(result).to.eql([])
        })
      })

      describe('with definition file', () => {
        describe('with a default', () => {
          it('returns the argv for the default profile', async function () {
            // Arrange
            const definitionsFileContent =
              'module.exports = {default: "--opt1 --opt2"}'

            // Act
            const result = await testGetArgv({ definitionsFileContent })

            // Assert
            expect(result).to.eql(['--opt1', '--opt2'])
          })
        })

        describe('without a default', () => {
          it('returns an empty array', async function () {
            // Arrange
            const definitionsFileContent =
              'module.exports = {profile1: "--opt1 --opt2"}'

            // Act
            const result = await testGetArgv({ definitionsFileContent })

            // Assert
            expect(result).to.eql([])
          })
        })
      })
    })

    describe('with identifiers', () => {
      describe('no definition file', () => {
        it('throws', async function () {
          // Arrange
          let caughtErrorMessage = ''

          // Act
          try {
            await testGetArgv({ profiles: ['profile1'] })
          } catch (error) {
            caughtErrorMessage = error.message
          }

          // Assert
          expect(caughtErrorMessage).to.eql('Undefined profile: profile1')
        })
      })

      describe('with definition file', () => {
        describe('profile is defined', () => {
          it('returns the argv for the given profile', async function () {
            // Arrange
            const definitionsFileContent =
              'module.exports = {profile1: "--opt1 --opt2"}'

            // Act
            const result = await testGetArgv({
              definitionsFileContent,
              profiles: ['profile1'],
            })

            // Assert
            expect(result).to.eql(['--opt1', '--opt2'])
          })
        })

        describe('profile is defined and contains quoted string', () => {
          it('returns the argv for the given profile', async function () {
            // Arrange
            const definitionsFileContent =
              'module.exports = {profile1: "--opt3 \'some value\'"}'

            // Act
            const result = await testGetArgv({
              definitionsFileContent,
              profiles: ['profile1'],
            })

            // Assert
            expect(result).to.eql(['--opt3', 'some value'])
          })
        })

        describe('profile is not defined', () => {
          it('throws', async function () {
            // Arrange
            let caughtErrorMessage = ''
            const definitionsFileContent =
              'module.exports = {profile1: "--opt1 --opt2"}'

            // Act
            try {
              await testGetArgv({
                definitionsFileContent,
                profiles: ['profile2'],
              })
            } catch (error) {
              caughtErrorMessage = error.message
            }

            // Assert
            expect(caughtErrorMessage).to.eql('Undefined profile: profile2')
          })
        })
      })
    })

    describe('with non-default configuration file', () => {
      it('returns the argv for the given profile', async function () {
        // Arrange
        const definitionsFileContent =
          'module.exports = {profile3: "--opt3 --opt4"}'

        // Act
        const result = await testGetArgv({
          definitionsFileContent,
          definitionsFileName: '.cucumber-rc.js',
          profiles: ['profile3'],
          configOption: '.cucumber-rc.js',
        })

        // Assert
        expect(result).to.eql(['--opt3', '--opt4'])
      })

      it('throws when the file doesnt exist', async () => {
        // Arrange
        const definitionsFileContent =
          'module.exports = {profile3: "--opt3 --opt4"}'

        // Act
        try {
          await testGetArgv({
            definitionsFileContent,
            profiles: [],
            configOption: 'doesntexist.js',
          })
          expect.fail('should throw')
        } catch (e) {
          expect(e.message).to.contain('Cannot find module')
        }
      })
    })
  })

  describe('getDefinitions', () => {
    async function testGetDefinitions(opts: {
      definitionsFileContent: string
      definitionsFileName: string
    }): Promise<Record<string, string>> {
      const cwd = await promisify<DirOptions, string>(tmp.dir)({
        unsafeCleanup: true,
      })
      const definitionsFileName = opts.definitionsFileName
      await fs.writeFile(
        path.join(cwd, definitionsFileName),
        opts.definitionsFileContent
      )
      const profileLoader = new ProfileLoader(cwd)
      return await profileLoader.getDefinitions(opts.definitionsFileName)
    }

    it('it returns the expected object from a commonjs file', async () => {
      const definitionsFileContent =
        'module.exports = {default: "foo", profile1: "bar"}'

      const result = await testGetDefinitions({
        definitionsFileContent,
        definitionsFileName: 'cucumber.js',
      })

      expect(Object.keys(result)).to.deep.eq(['default', 'profile1'])
    })

    it('it returns the expected object from an esm file', async () => {
      const definitionsFileContent =
        'export default "foo"; export const profile1 = "bar";'

      const result = await testGetDefinitions({
        definitionsFileContent,
        definitionsFileName: 'cucumber.mjs',
      })

      expect(Object.keys(result)).to.deep.eq(['default', 'profile1'])
    })
  })
})
