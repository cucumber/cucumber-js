// biome-ignore lint/suspicious/noExplicitAny: world parameters come from user config and really can be anything; users can supply a type argument to narrow
export interface IContext<ParametersType = any> {
  readonly parameters: ParametersType
}
