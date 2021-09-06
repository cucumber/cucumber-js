import { describe, it } from 'mocha'
import { expect } from 'chai'
import fs from 'mz/fs'
import path from 'path'
import ProfileLoader from './profile_loader'
import tmp, { DirOptions } from 'tmp'
import { promisify } from 'util'
import { doesHaveValue, valueOrDefault } from '../value_checker'

interface TestProfileLoaderOptions {
  definitionsFileContent?: string
  profiles?: string[]
  configFile?: string
}

async function testProfileLoader(
  opts: TestProfileLoaderOptions = {}
): Promise<string[]> {
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  let configurationFileName = 'cucumber.js'

  if (doesHaveValue(opts.configFile)) {
    configurationFileName = opts.configFile
  }

  if (doesHaveValue(opts.definitionsFileContent)) {
    await fs.writeFile(
      path.join(cwd, configurationFileName),
      opts.definitionsFileContent
    )
  }

  const profileLoader = new ProfileLoader(cwd)
  return await profileLoader.getArgv(
    valueOrDefault(opts.profiles, []),
    opts.configFile
  )
}

describe('ProfileLoader', () => {
  describe('getArgv', () => {
    describe('with no identifiers', () => {
      describe('no definition file', () => {
        it('returns an empty array', async function () {
          // Arrange

          // Act
          const result = await testProfileLoader()

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
            const result = await testProfileLoader({ definitionsFileContent })

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
            const result = await testProfileLoader({ definitionsFileContent })

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
            await testProfileLoader({ profiles: ['profile1'] })
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
            const result = await testProfileLoader({
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
            const result = await testProfileLoader({
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
              await testProfileLoader({
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
        const result = await testProfileLoader({
          definitionsFileContent,
          profiles: ['profile3'],
          configFile: '.cucumber-rc.js',
        })

        // Assert
        expect(result).to.eql(['--opt3', '--opt4'])
      })
    })
  })
})
