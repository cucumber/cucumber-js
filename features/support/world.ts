import { execFile } from 'node:child_process'
import { Console } from 'node:console'
import fs from 'node:fs'
import path from 'node:path'
import { PassThrough, pipeline, Writable } from 'node:stream'
import util from 'node:util'
import { NdjsonToMessageStream } from '@cucumber/message-streams'
import type { Envelope } from '@cucumber/messages'
import { expect } from 'chai'
import streamToString from 'stream-to-string'
import { setWorldConstructor } from '../../'
import { type IRunEnvironment, loadConfiguration, runCucumber } from '../../lib/api'
import { ArgvParser } from '../../lib/configuration'
import { doesHaveValue } from '../../src/value_checker'
import type FakeProxyServer from '../../test/fake_proxy_server'
import type FakeReportServer from '../../test/fake_report_server'

const asyncPipeline = util.promisify(pipeline)

interface ILastRun {
  error: any
  errorOutput: string
  envelopes: Envelope[]
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
  public proxyServer: FakeProxyServer

  parseEnvString(str: string): NodeJS.ProcessEnv {
    const result: NodeJS.ProcessEnv = {}
    if (doesHaveValue(str)) {
      try {
        Object.assign(result, JSON.parse(str))
      } catch {
        for (const pair of str.split(/\s+/).map((keyValue) => keyValue.split('='))) {
          result[pair[0]] = pair[1]
        }
      }
    }
    return result
  }

  async run(
    executablePath: string,
    inputArgs: string[],
    envOverride: NodeJS.ProcessEnv = {}
  ): Promise<void> {
    const messageFilename = 'message.ndjson'
    const args = ['node', executablePath].concat(inputArgs, [
      '--backtrace',
      '--format',
      `message:${messageFilename}`,
    ])
    const cwd = this.tmpDir

    let result: IRunResult

    if (this.spawn) {
      const env = { ...process.env, ...this.sharedEnv, ...envOverride }
      result = await new Promise((resolve) => {
        execFile(args[0], args.slice(1), { cwd, env }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr })
        })
      })
    } else {
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const environment: IRunEnvironment = { cwd, stdout, stderr }
      let error: any
      for (const key of Object.keys(envOverride)) {
        process.env[key] = envOverride[key]
      }
      try {
        const { options, configuration: argvConfiguration } = ArgvParser.parse(args)
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
      } finally {
        for (const key of Object.keys(envOverride)) {
          delete process.env[key]
        }
      }
      if (error) {
        new Console(stderr).error(error)
      }
      stdout.end()
      stderr.end()
      result = {
        error,
        stdout: await streamToString(stdout),
        stderr: await streamToString(stderr),
      }
    }
    const envelopes: Envelope[] = []
    const messageOutputPath = path.join(cwd, messageFilename)
    if (fs.existsSync(messageOutputPath)) {
      await asyncPipeline(
        fs.createReadStream(messageOutputPath, { encoding: 'utf-8' }),
        new NdjsonToMessageStream(),
        new Writable({
          objectMode: true,
          write(envelope: Envelope, _: BufferEncoding, callback) {
            envelopes.push(envelope)
            callback()
          },
        })
      )
    }
    if (this.debug) {
      // biome-ignore lint/suspicious/noConsole: debug output for the test runner
      console.log(result.stdout + result.stderr)
    }
    this.lastRun = {
      error: result.error,
      errorOutput: result.stderr,
      envelopes,
      output: util.stripVTControlCharacters(result.stdout),
    }
    this.verifiedLastRunError = false
    expect(this.lastRun.output).to.not.include('Unhandled rejection')
  }
}

setWorldConstructor(World)
