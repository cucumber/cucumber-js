import { expect } from 'chai'
import fsExtra from 'fs-extra'
import Mustache from 'mustache'
import fs from 'mz/fs'
import path from 'path'

import { Given, Then } from '../../'
import { normalizeText } from '../support/helpers'
import { World } from '../support/world'

Given(
  /^a file named "(.*)" with:$/,
  async function (this: World, filePath: string, fileContent: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    if (filePath === '@rerun.txt') {
      fileContent = fileContent.replace(/\//g, path.sep)
    }
    await fsExtra.outputFile(absoluteFilePath, fileContent)
  }
)

Given(
  /^an empty file named "(.*)"$/,
  async function (this: World, filePath: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    await fsExtra.outputFile(absoluteFilePath, '')
  }
)

Given(
  /^a directory named "(.*)"$/,
  async function (this: World, filePath: string) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    await fsExtra.mkdirp(absoluteFilePath)
  }
)

Given(
  /^"([^"]*)" is an absolute path$/,
  function (this: World, filePath: string) {
    filePath = Mustache.render(filePath, this)
    expect(path.isAbsolute(filePath)).to.eql(true)
  }
)

Then(
  /^the file "([^"]*)" has the text:$/,
  async function (this: World, filePath: string, text: string) {
    filePath = Mustache.render(filePath, this)
    const absoluteFilePath = path.resolve(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    const actualContent = normalizeText(content)
    const expectedContent = normalizeText(text)
    expect(actualContent).to.eql(expectedContent)
  }
)
