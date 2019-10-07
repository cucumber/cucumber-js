import { DIALECTS } from 'gherkin'

/**
 * If the keyword is one of the language's scenario outline keywords,
 * return the language's first scenario keyword
 * Otherwise returns the keyword
 */
export function normalizeScenarioKeyword(keyword, language) {
  const keywords = DIALECTS[language]['scenarioOutline']
  if (keywords.find(k => k === keyword)) {
    keyword = DIALECTS[language]['scenario'][0]
  }
  return keyword
}
