import path from 'node:path'
import { expect } from 'chai'
import hasAnsi from 'has-ansi'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import Mustache from 'mustache'
import { normalizeText } from '../support/helpers'
import { Given, Then } from '../../'
import { World } from '../support/world'

Given(
  'a file named {string} with:',
  async function (this: World, filePath: string, fileContent: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    if (filePath === '@rerun.txt') {
      fileContent = fileContent.replace(/\//g, path.sep)
    }
    await fsExtra.outputFile(absoluteFilePath, fileContent)
  }
)

Given(
  'an empty file named {string}',
  async function (this: World, filePath: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    await fsExtra.outputFile(absoluteFilePath, '')
  }
)

Given(
  'a directory named {string}',
  async function (this: World, filePath: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    await fsExtra.mkdirp(absoluteFilePath)
  }
)

Given('{string} is an absolute path', function (this: World, filePath: string) {
  filePath = Mustache.render(filePath, this)
  expect(path.isAbsolute(filePath)).to.eql(true)
})

Then(
  'the file {string} has the text:',
  async function (this: World, filePath: string, text: string) {
    filePath = Mustache.render(filePath, this)
    const absoluteFilePath = path.resolve(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    const actualContent = normalizeText(content)
    const expectedContent = normalizeText(text)
    expect(actualContent).to.eql(expectedContent)
  }
)

Then(
  'the file {string} contains colors',
  async function (this: World, filePath: string) {
    filePath = Mustache.render(filePath, this)
    const absoluteFilePath = path.resolve(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    expect(hasAnsi(content)).to.be.true
  }
)

Then(
  "the file {string} doesn't contain colors",
  async function (this: World, filePath: string) {
    filePath = Mustache.render(filePath, this)
    const absoluteFilePath = path.resolve(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    expect(hasAnsi(content)).to.be.false
  }
)
