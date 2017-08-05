import JavascriptSnippetSyntax from './javascript_snippet_syntax'

describe('JavascriptSnippetSyntax', function() {
  describe('build()', function() {
    describe('callback interface', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('callback')
      })

      it('returns the proper snippet', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              source: 'pattern',
              parameterNames: ['arg1', 'arg2']
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern', function (arg1, arg2, callback) {\n" +
          '  // comment\n' +
          "  callback(null, 'pending');\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })

    describe('generator interface', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('generator')
      })

      it('returns the proper snippet', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              source: 'pattern',
              parameterNames: ['arg1', 'arg2']
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern', function *(arg1, arg2) {\n" +
          '  // comment\n' +
          "  return 'pending';\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })

    describe('promise interface', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('promise')
      })

      it('returns the proper snippet', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              source: 'pattern',
              parameterNames: ['arg1', 'arg2']
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern', function (arg1, arg2) {\n" +
          '  // comment\n' +
          "  return 'pending';\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })

    describe('synchronous interface', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('synchronous')
      })

      it('returns the proper snippet', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              source: 'pattern',
              parameterNames: ['arg1', 'arg2']
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern', function (arg1, arg2) {\n" +
          '  // comment\n' +
          "  return 'pending';\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })

    describe('pattern contains single quote', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('synchronous')
      })

      it('returns the proper snippet', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              source: "pattern'",
              parameterNames: ['arg1', 'arg2']
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern\\'', function (arg1, arg2) {\n" +
          '  // comment\n' +
          "  return 'pending';\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })

    describe('multiple patterns', function() {
      beforeEach(function() {
        this.syntax = new JavascriptSnippetSyntax('synchronous')
      })

      it('returns the snippet with the other choices commented out', function() {
        const actual = this.syntax.build({
          comment: 'comment',
          functionName: 'functionName',
          generatedExpressions: [
            {
              parameterNames: ['argA', 'argB'],
              source: 'pattern1'
            },
            {
              parameterNames: ['argC', 'argD'],
              source: 'pattern2'
            },
            {
              parameterNames: ['argE', 'argF'],
              source: 'pattern3'
            }
          ],
          stepParameterNames: []
        })
        const expected =
          "functionName('pattern1', function (argA, argB) {\n" +
          "// functionName('pattern2', function (argC, argD) {\n" +
          "// functionName('pattern3', function (argE, argF) {\n" +
          '  // comment\n' +
          "  return 'pending';\n" +
          '});'
        expect(actual).to.eql(expected)
      })
    })
  })
})
