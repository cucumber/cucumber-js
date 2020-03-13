import { setWorldConstructor, Cli } from '../../'
import { execFile } from 'child_process'
import { expect } from 'chai'
import toString from 'stream-to-string'
import { PassThrough } from 'stream'
import colors from 'colors/safe'
import fs from 'fs'
import path from 'path'
import VError from 'verror'
import _ from 'lodash'
import protobuf from 'protobufjs'
import { messages } from 'cucumber-messages'

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

  async run(executablePath: string, inputArgs: string[]): Promise<void> {
    const messageFilename = 'message.out'
    const args = ['node', executablePath]
      .concat(inputArgs, [
        '--backtrace',
        '--predictable-ids',
        '--format',
        `message:${messageFilename}`,
      ])
      .map(arg => {
        if (_.includes(arg, '/')) {
          return path.normalize(arg)
        }
        return arg
      })
    const cwd = this.tmpDir

    let result: IRunResult

    if (this.spawn) {
      result = await new Promise(resolve => {
        execFile(args[0], args.slice(1), { cwd }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr })
        })
      })
    } else {
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const cli = new Cli({
        argv: args,
        cwd,
        stdout,
      })
      let error: any
      try {
        const { success } = await cli.run()
        if (!success) {
          error = new Error('CLI exited with non-zero')
          error.code = 42
        }
      } catch (err) {
        error = err
        stderr.write(VError.fullStack(error))
      }
      stdout.end()
      stderr.end()
      result = {
        error,
        stdout: await toString(stdout),
        stderr: await toString(stderr),
      }
    }
    const envelopes: messages.Envelope[] = []
    const messageOutputPath = path.join(cwd, messageFilename)
    if (fs.existsSync(messageOutputPath)) {
      const data = fs.readFileSync(messageOutputPath)
      const reader = protobuf.Reader.create(data)
      while (reader.pos < reader.len) {
        envelopes.push(messages.Envelope.decodeDelimited(reader))
      }
      fs.writeFileSync(
        path.join(cwd, 'message.out.json'),
        JSON.stringify(
          envelopes.map(e => e.toJSON()),
          null,
          2
        )
      )
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
