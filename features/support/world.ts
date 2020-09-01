import { Cli, setWorldConstructor } from '../../'
import { execFile } from 'child_process'
import { expect } from 'chai'
import toString from 'stream-to-string'
import { PassThrough } from 'stream'
import colors from 'colors/safe'
import fs from 'fs'
import path from 'path'
import VError from 'verror'
import _ from 'lodash'
import ndjsonParse from 'ndjson-parse'
import { messages } from '@cucumber/messages'

interface ILastRun {
  error: any
  errorOutput: string
  envelopes: messages.IEnvelope[]
  output: string
}

interface IRunResult {
  error: any
  stderr: string
  stdout: string
}

export class World {
  public tmpDir: string
  public spawn: boolean = false
  public debug: boolean = false
  public lastRun: ILastRun
  public verifiedLastRunError: boolean
  public localExecutablePath: string
  public globalExecutablePath: string

  async run(
    executablePath: string,
    inputArgs: string[],
    env: NodeJS.ProcessEnv = process.env
  ): Promise<void> {
    const messageFilename = 'message.ndjson'
    const args = ['node', executablePath]
      .concat(inputArgs, [
        '--backtrace',
        '--predictable-ids',
        '--format',
        `message:${messageFilename}`,
      ])
      .map((arg) => {
        if (_.includes(arg, '/')) {
          return path.normalize(arg)
        }
        return arg
      })
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
      const cli = new Cli({
        argv: args,
        cwd,
        stdout,
      })
      let error: any, stderr: string
      try {
        const { success } = await cli.run()
        if (!success) {
          error = new Error('CLI exited with non-zero')
          error.code = 42
        }
        stderr = ''
      } catch (err) {
        error = err
        stderr = VError.fullStack(error)
      }
      stdout.end()
      result = { error, stdout: await toString(stdout), stderr }
    }
    let envelopes: messages.Envelope[] = []
    const messageOutputPath = path.join(cwd, messageFilename)
    if (fs.existsSync(messageOutputPath)) {
      const data = fs.readFileSync(messageOutputPath, { encoding: 'utf-8' })
      envelopes = ndjsonParse(data).map(messages.Envelope.fromObject)
    }
    if (this.debug) {
      console.log(result.stdout + result.stderr) // eslint-disable-line no-console
    }
    this.lastRun = {
      error: result.error,
      errorOutput: result.stderr,
      envelopes,
      output: colors.strip(result.stdout),
    }
    this.verifiedLastRunError = false
    expect(this.lastRun.output).to.not.include('Unhandled rejection')
  }
}

setWorldConstructor(World)
