import { Given, Then } from '../../'
import { expect } from 'chai'
import { normalizeText } from '../support/helpers'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import path from 'path'
import Mustache from 'mustache'
import { World } from '../support/world'

Given(/^a file named "(.*)" with:$/, function(
  this: World,
  filePath,
  fileContent
) {
  const absoluteFilePath = path.join(this.tmpDir, filePath)
  if (filePath === '@rerun.txt') {
    fileContent = fileContent.replace(/\//g, path.sep)
  }
  return fsExtra.outputFile(absoluteFilePath, fileContent)
})

Given(/^an empty file named "(.*)"$/, function(this: World, filePath) {
  const absoluteFilePath = path.join(this.tmpDir, filePath)
  return fsExtra.outputFile(absoluteFilePath, '')
})

Given(/^a directory named "(.*)"$/, function(this: World, filePath) {
  const absoluteFilePath = path.join(this.tmpDir, filePath)
  return fsExtra.mkdirp(absoluteFilePath)
})

Given(/^"([^"]*)" is an absolute path$/, function(this: World, filePath) {
  filePath = Mustache.render(filePath, this)
  expect(path.isAbsolute(filePath)).to.eql(true)
})

Then(/^the file "([^"]*)" has the text:$/, async function(
  this: World,
  filePath,
  text
) {
  filePath = Mustache.render(filePath, this)
  const absoluteFilePath = path.resolve(this.tmpDir, filePath)
  const content = await fs.readFile(absoluteFilePath, 'utf8')
  const actualContent = normalizeText(content)
  const expectedContent = normalizeText(text)
  expect(actualContent).to.eql(expectedContent)
})
