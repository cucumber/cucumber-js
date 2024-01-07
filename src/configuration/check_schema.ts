import * as yup from 'yup'
import { dialects } from '@cucumber/gherkin'
import { IConfiguration } from './types'

const schema = yup.object().shape({
  backtrace: yup.boolean(),
  dryRun: yup.boolean(),
  exit: yup.boolean(),
  failFast: yup.boolean(),
  format: yup
    .array()
    .of(
      yup.lazy((val) =>
        Array.isArray(val)
          ? yup.array().of(yup.string()).min(1).max(2)
          : yup.string()
      )
    ),
  formatOptions: yup.object(),
  import: yup.array().of(yup.string()),
  language: yup.string().oneOf(Object.keys(dialects)),
  name: yup.array().of(yup.string()),
  order: yup.string().matches(/^random:.*|random|defined$/),
  paths: yup.array().of(yup.string()),
  parallel: yup.number().integer().min(0),
  publish: yup.boolean(),
  publishQuiet: yup.boolean(),
  require: yup.array().of(yup.string()),
  requireModule: yup.array().of(yup.string()),
  retry: yup.number().integer().min(0),
  retryTagFilter: yup.string(),
  strict: yup.boolean(),
  tags: yup.string(),
  worldParameters: yup.object(),
})

export function checkSchema(configuration: any): Partial<IConfiguration> {
  return schema.validateSync(configuration, {
    abortEarly: false,
    strict: true,
    stripUnknown: true,
  }) as Partial<IConfiguration>
}
