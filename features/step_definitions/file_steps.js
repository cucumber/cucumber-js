/* eslint-disable babel/new-cap */

import { defineSupportCode } from '../../'
import { expect } from 'chai'
import { normalizeText } from '../support/helpers'
import { promisify } from 'bluebird'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import path from 'path'

defineSupportCode(function({ Given, Then }) {
  Given(/^a file named "(.*)" with:$/, function(filePath, fileContent) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.outputFile)(absoluteFilePath, fileContent)
  })

  Given(/^an empty file named "(.*)"$/, function(filePath) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.outputFile)(absoluteFilePath, '')
  })

  Given(/^a directory named "(.*)"$/, function(filePath) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    return promisify(fsExtra.mkdirp)(absoluteFilePath)
  })

  Then(/^the file "([^"]*)" has the text:$/, async function(filePath, text) {
    const absoluteFilePath = path.join(this.tmpDir, filePath)
    const content = await fs.readFile(absoluteFilePath, 'utf8')
    const actualContent = normalizeText(content)
    const expectedContent = normalizeText(text)
    expect(actualContent).to.eql(expectedContent)
  })
})
