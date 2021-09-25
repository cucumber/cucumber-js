const FormatterDocumentation = {
  getFormatterDocumentationByType(type: string): string {
    const formatterDocumentationText: Record<string, string> = {
      json: 'Prints the feature as JSON. The JSON format is in maintenance mode. Please consider using the message formatter with the standalone json-formatter (https://github.com/cucumber/cucumber/tree/master/json-formatter).',
      message: 'Outputs protobuf messages',
      html: 'Outputs HTML report',
      progress: 'Prints one character per scenario.',
      'progress-bar': '',
      rerun: 'Prints failing files with line numbers.',
      snippets: '',
      summary: 'Summary output of feature and scenarios',
      usage:
        'Prints where step definitions are used. The slowest step definitions (with duration) are listed first. If --dry-run is used the duration is not shown, and step definitions are sorted by filename instead.',
      'usage-json': '',
    }

    return formatterDocumentationText[type]
  },
}

export default FormatterDocumentation
