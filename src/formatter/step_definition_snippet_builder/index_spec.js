import KeywordType from '../../keyword_type'
import StepDefinitionSnippetBuilder from './'
import TransformLookupBuilder from '../../support_code_library/parameter_type_registry_builder'

describe('StepDefinitionSnippetBuilder', function() {
  beforeEach(function() {
    this.snippetSyntax = createMock(['build'])
    this.transformsLookup = TransformLookupBuilder.build()
    this.snippetBuilder = new StepDefinitionSnippetBuilder({
      snippetSyntax: this.snippetSyntax,
      parameterTypeRegistry: this.transformsLookup
    })
  })

  describe('build()', function() {
    beforeEach(function() {
      this.input = {
        keywordType: KeywordType.PRECONDITION,
        pickledStep: {
          arguments: [],
          text: ''
        }
      }
    })

    describe('step is an precondition step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.PRECONDITION
        this.result = this.snippetBuilder.build(this.input)
      })

      it('uses Given as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('Given')
      })
    })

    describe('step is an event step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.EVENT
        this.result = this.snippetBuilder.build(this.input)
      })

      it('uses When as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('When')
      })
    })

    describe('step is an outcome step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.OUTCOME
        this.result = this.snippetBuilder.build(this.input)
      })

      it('uses Then as the function name', function() {
        expect(this.snippetSyntax.build.firstCall.args[0]).to.eql('Then')
      })
    })

    describe('step has simple name', function() {
      beforeEach(function() {
        this.input.pickledStep.text = 'abc'
        this.result = this.snippetBuilder.build(this.input)
      })

      it('returns the cucumber expression', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql('abc')
      })
    })

    describe('step name has a quoted string', function() {
      beforeEach(function() {
        this.input.pickledStep.text = 'abc "def" ghi'
        this.result = this.snippetBuilder.build(this.input)
      })

      it('replaces the quoted string with a capture group and adds a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql(
          'abc {stringInDoubleQuotes} ghi'
        )
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'stringInDoubleQuotes',
          'callback'
        ])
      })
    })

    describe('step name has multiple quoted strings', function() {
      beforeEach(function() {
        this.input.pickledStep.text = 'abc "def" ghi "jkl" mno'
        this.result = this.snippetBuilder.build(this.input)
      })

      it('replaces the quoted strings with capture groups and adds parameters', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql(
          'abc {stringInDoubleQuotes} ghi {stringInDoubleQuotes} mno'
        )
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'stringInDoubleQuotes',
          'stringInDoubleQuotes2',
          'callback'
        ])
      })
    })

    describe('step name has a standalone number', function() {
      beforeEach(function() {
        this.input.pickledStep.text = 'abc 123 def'
        this.result = this.snippetBuilder.build(this.input)
      })

      it('replaces the number with a capture group and adds a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[1]).to.eql(
          'abc {int} def'
        )
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'int',
          'callback'
        ])
      })
    })

    describe('step has a data table argument', function() {
      beforeEach(function() {
        this.input.pickledStep.arguments = [{ rows: [] }]
        this.result = this.snippetBuilder.build(this.input)
      })

      it('passes table as a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'table',
          'callback'
        ])
      })
    })

    describe('step has a doc string argument', function() {
      beforeEach(function() {
        this.input.pickledStep.arguments = [{ content: '' }]
        this.result = this.snippetBuilder.build(this.input)
      })

      it('passes table as a parameter', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'string',
          'callback'
        ])
      })
    })

    describe('step name has multiple quoted strings and a data table argument', function() {
      beforeEach(function() {
        this.input.pickledStep.text = 'abc "def" ghi "jkl" mno'
        this.input.pickledStep.arguments = [{ rows: [] }]
        this.result = this.snippetBuilder.build(this.input)
      })

      it('puts the table argument after the capture groups', function() {
        expect(this.snippetSyntax.build.firstCall.args[2]).to.eql([
          'stringInDoubleQuotes',
          'stringInDoubleQuotes2',
          'table',
          'callback'
        ])
      })
    })
  })
})
