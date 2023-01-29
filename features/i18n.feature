@spawn
Feature: internationalization

  Scenario: view available languages
    When I run cucumber-js with `--i18n-languages`
    Then the output contains the text:
      """
      ISO 639-1 | ENGLISH  NAME        | NATIVE NAME
      af        | Afrikaans            | Afrikaans
      """
    Then the output contains the text:
      """
      ja        | Japanese            | 日本語
      """

  Scenario: invalid iso code
    When I run cucumber-js with `--i18n-keywords XX`
    Then the error output contains the text:
      """
      Unsupported ISO 639-1: XX
      """
    And it fails

  Scenario: view language keywords
    When I run cucumber-js with `--i18n-keywords ja`
    Then it outputs the text:
      """
      ENGLISH KEYWORD  | NATIVE KEYWORDS
      Feature          | "フィーチャ", "機能"
      Rule             | "ルール"
      Background       | "背景"
      Scenario         | "シナリオ"
      Scenario Outline | "シナリオアウトライン", "シナリオテンプレート", "テンプレ", "シナリオテンプレ"
      Examples         | "例", "サンプル"
      Given            | "* ", "前提"
      When             | "* ", "もし"
      Then             | "* ", "ならば"
      And              | "* ", "且つ", "かつ"
      But              | "* ", "然し", "しかし", "但し", "ただし"
      """
