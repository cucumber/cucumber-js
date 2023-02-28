import { setWorldConstructor } from '../../'
import { execFile } from 'child_process'
import { expect } from 'chai'
import toString from 'stream-to-string'
import { PassThrough, pipeline, Writable } from 'stream'
import stripAnsi from 'strip-ansi'
import fs from 'fs'
import path from 'path'
import VError from 'verror'
import * as messages from '@cucumber/messages'
import * as messageStreams from '@cucumber/message-streams'
import FakeReportServer from '../../test/fake_report_server'
import { doesHaveValue } from '../../src/value_checker'
import util from 'util'
import { IRunEnvironment, loadConfiguration, runCucumber } from '../../lib/api'
import { ArgvParser } from '../../lib/configuration'

const asyncPipeline = util.promisify(pipeline)

interface ILastRun {
  error: any
  errorOutput: string
  envelopes: messages.Envelope[]
  output: string
}

interface IRunResult {
  error: any
  stderr: string
  stdout: string
}

export class World {
  public tmpDir: string
  public sharedEnv: NodeJS.ProcessEnv
  public spawn: boolean = false
  public debug: boolean = false
  public lastRun: ILastRun
  public verifiedLastRunError: boolean
  public localExecutablePath: string
  public reportServer: FakeReportServer

  parseEnvString(str: string): NodeJS.ProcessEnv {
    const result: NodeJS.ProcessEnv = {}
    if (doesHaveValue(str)) {
      try {
        Object.assign(result, JSON.parse(str))
      } catch {
        str
          .split(/\s+/)
          .map((keyValue) => keyValue.split('='))
          .forEach((pair) => (result[pair[0]] = pair[1]))
      }
    }
    return result
  }

  async run(
    executablePath: string,
    inputArgs: string[],
    envOverride: NodeJS.ProcessEnv = null
  ): Promise<void> {
    const messageFilename = 'message.ndjson'
    const args = ['node', executablePath].concat(inputArgs, [
      '--backtrace',
      '--format',
      `message:${messageFilename}`,
    ])
    const env = { ...process.env, ...this.sharedEnv, ...envOverride }
    const cwd = this.tmpDir

    let result: IRunResult

    if (this.spawn) {
      result = await new Promise((resolve) => {
        execFile(
          args[0],
          args.slice(1),
          { cwd, env },
          (error, stdout, stderr) => {
            resolve({ error, stdout, stderr })
          }
        )
      })
    } else {
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const environment: IRunEnvironment = { cwd, stdout, stderr, env }
      let error: any
      try {
        const { options, configuration: argvConfiguration } =
          ArgvParser.parse(args)
        const { runConfiguration } = await loadConfiguration(
          {
            file: options.config,
            profiles: options.profile,
            provided: argvConfiguration,
          },
          environment
        )
        const { success } = await runCucumber(runConfiguration, environment)
        if (!success) {
          error = new Error('runCucumber was not successful')
          error.code = 42
        }
      } catch (err) {
        error = err
      }
      stdout.end()
      stderr.end()
      const stderrSuffix = error != null ? VError.fullStack(error) : ''
      result = {
        error,
        stdout: await toString(stdout),
        stderr: (await toString(stderr)) + stderrSuffix,
      }
    }
    const envelopes: messages.Envelope[] = []
    const messageOutputPath = path.join(cwd, messageFilename)
    if (fs.existsSync(messageOutputPath)) {
      await asyncPipeline(
        fs.createReadStream(messageOutputPath, { encoding: 'utf-8' }),
        new messageStreams.NdjsonToMessageStream(),
        new Writable({
          objectMode: true,
          write(envelope: messages.Envelope, _: BufferEncoding, callback) {
            envelopes.push(envelope)
            callback()
          },
        })
      )
    }
    if (this.debug) {
      console.log(result.stdout + result.stderr) // eslint-disable-line no-console
    }
    this.lastRun = {
      error: result.error,
      errorOutput: result.stderr,
      envelopes,
      output: stripAnsi(result.stdout),
    }
    this.verifiedLastRunError = false
    expect(this.lastRun.output).to.not.include('Unhandled rejection')
  }
}

setWorldConstructor(World)
