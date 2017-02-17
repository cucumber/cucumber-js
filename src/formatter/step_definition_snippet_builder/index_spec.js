import DataTable from '../../models/step_arguments/data_table'
import DocString from '../../models/step_arguments/doc_string'
import KeywordType from '../../keyword_type'
import StepDefinitionSnippetBuilder from './'
import TransformLookupBuilder from '../../support_code_library/transform_lookup_builder'

describe('StepDefinitionSnippetBuilder', function () {
  beforeEach(function () {
    this.snippetSyntax = createMock(['build'])
    this.transformsLookup = TransformLookupBuilder.build()
    this.snippetBuilder = new StepDefinitionSnippetBuilder({
      snippetSyntax: this.snippetSyntax,
      parameterRegistry: this.transformsLookup
    })
  })

  describe('build()', function () {
    beforeEach(function() {
      this.step = {
        arguments: [],
        keywordType: KeywordType.PRECONDITION,
        name: ''
      }
    })

    describe('step is an precondition step', function() {
      beforeEach(function() {
        this.step.keywordType = KeywordType.PRECONDITION
        this.result = this.snippetBuilder.build(this.step)
      })

      it('uses Given as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('Given')
      })
    })

    describe('step is an event step', function() {
      beforeEach(function() {
        this.step.keywordType = KeywordType.EVENT
        this.result = this.snippetBuilder.build(this.step)
      })

      it('uses When as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('When')
      })
    })

    describe('step is an outcome step', function() {
      beforeEach(function() {
        this.step.keywordType = KeywordType.OUTCOME
        this.result = this.snippetBuilder.build(this.step)
      })

      it('uses Then as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('Then')
      })
    })

    describe('step has simple name', function() {
      beforeEach(function() {
        this.step.name = 'abc'
        this.result = this.snippetBuilder.build(this.step)
      })

      it('returns the cucumber expression', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql('abc')
      })
    })

    describe('step name has a quoted string', function() {
      beforeEach(function() {
        this.step.name = 'abc "def" ghi'
        this.result = this.snippetBuilder.build(this.step)
      })

      it('replaces the quoted string with a capture group and adds a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql('abc {stringInDoubleQuotes} ghi')
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['stringInDoubleQuotes', 'callback'])
      })
    })

    describe('step name has multiple quoted strings', function() {
      beforeEach(function() {
        this.step.name = 'abc "def" ghi "jkl" mno'
        this.result = this.snippetBuilder.build(this.step)
      })

      it('replaces the quoted strings with capture groups and adds parameters', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql('abc {stringInDoubleQuotes} ghi {stringInDoubleQuotes} mno')
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['stringInDoubleQuotes', 'stringInDoubleQuotes2', 'callback'])
      })
    })

    describe('step name has a standalone number', function() {
      beforeEach(function() {
        this.step.name = 'abc 123 def'
        this.result = this.snippetBuilder.build(this.step)
      })

      it('replaces the number with a capture group and adds a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql('abc {int} def')
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['int', 'callback'])
      })
    })

    describe('step has a data table argument', function() {
      beforeEach(function() {
        this.step.arguments = [new DataTable({rows: []})]
        this.result = this.snippetBuilder.build(this.step)
      })

      it('passes table as a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['table', 'callback'])
      })
    })

    describe('step has a doc string argument', function() {
      beforeEach(function() {
        this.step.arguments = [Object.create(DocString.prototype)]
        this.result = this.snippetBuilder.build(this.step)
      })

      it('passes table as a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['string', 'callback'])
      })
    })

    describe('step name has multiple quoted strings and a data table argument', function() {
      beforeEach(function() {
        this.step.name = 'abc "def" ghi "jkl" mno'
        this.step.arguments = [Object.create(DataTable.prototype)]
        this.result = this.snippetBuilder.build(this.step)
      })

      it('puts the table argument after the capture groups', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql(['stringInDoubleQuotes', 'stringInDoubleQuotes2', 'table', 'callback'])
      })
    })
  })
})
