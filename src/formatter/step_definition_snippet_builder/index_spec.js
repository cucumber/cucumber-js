import { KeywordType } from '../helpers'
import StepDefinitionSnippetBuilder from './'
import TransformLookupBuilder from '../../support_code_library_builder/parameter_type_registry_builder'

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
        pickleStep: {
          arguments: [],
          text: ''
        }
      }
    })

    describe('step is an precondition step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.PRECONDITION
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('uses Given as the function name', function() {
        expect(this.arg.functionName).to.eql('Given')
      })
    })

    describe('step is an event step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.EVENT
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('uses When as the function name', function() {
        expect(this.arg.functionName).to.eql('When')
      })
    })

    describe('step is an outcome step', function() {
      beforeEach(function() {
        this.input.keywordType = KeywordType.OUTCOME
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('uses Then as the function name', function() {
        expect(this.arg.functionName).to.eql('Then')
      })
    })

    describe('step has simple name', function() {
      beforeEach(function() {
        this.input.pickleStep.text = 'abc'
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('adds the proper generated expression', function() {
        let generatedExpression = this.arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc')
        expect(generatedExpression.parameterNames).to.eql([])
      })
    })

    describe('step name has a quoted string', function() {
      beforeEach(function() {
        this.input.pickleStep.text = 'abc "def" ghi'
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('adds the proper generated expression', function() {
        let generatedExpression = this.arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc {string} ghi')
        expect(generatedExpression.parameterNames).to.eql(['string'])
      })
    })

    describe('step name has multiple quoted strings', function() {
      beforeEach(function() {
        this.input.pickleStep.text = 'abc "def" ghi "jkl" mno'
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('adds the proper generated expression', function() {
        let generatedExpression = this.arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql(
          'abc {string} ghi {string} mno'
        )
        expect(generatedExpression.parameterNames).to.eql(['string', 'string2'])
      })
    })

    describe('step name has a standalone number', function() {
      beforeEach(function() {
        this.input.pickleStep.text = 'abc 123 def'
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('adds the proper generated expression', function() {
        let generatedExpression = this.arg.generatedExpressions[0]
        expect(generatedExpression.source).to.eql('abc {int} def')
        expect(generatedExpression.parameterNames).to.eql(['int'])
      })
    })

    describe('step has no arguments', function() {
      beforeEach(function() {
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('passes no step parameter names', function() {
        expect(this.arg.stepParameterNames).to.eql([])
      })
    })

    describe('step has a data table argument', function() {
      beforeEach(function() {
        this.input.pickleStep.arguments = [{ rows: [] }]
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('passes dataTable as a step parameter name', function() {
        expect(this.arg.stepParameterNames).to.eql(['dataTable'])
      })
    })

    describe('step has a doc string argument', function() {
      beforeEach(function() {
        this.input.pickleStep.arguments = [{ content: '' }]
        this.result = this.snippetBuilder.build(this.input)
        this.arg = this.snippetSyntax.build.firstCall.args[0]
      })

      it('passes docString as a step parameter name', function() {
        expect(this.arg.stepParameterNames).to.eql(['docString'])
      })
    })
  })
})
