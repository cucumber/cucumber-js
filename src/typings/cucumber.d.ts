// Type definitions for cucumber-js
// Project: https://github.com/cucumber/cucumber-js
// Definitions by: Abraão Alves <https://github.com/abraaoalves>, Jan Molak <https://github.com/jan-molak>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = cucumber;

declare namespace cucumber {

  export function defineSupportCode(consumer: ISupportCodeConsumer): void;
  export function getSupportCodeFns(): ISupportCodeConsumer[];
  export function clearSupportCodeFns(): void;

  export interface ISupportCodeConsumer {
    addTransform(options: ITransformOptions): void;
    After(fn: IHookDefinitionFunction): void;
    After(options: IHookOptions, fn: IHookDefinitionFunction): void;
    After(tags: string, fn: IHookDefinitionFunction): void;
    Before(fn: IHookDefinitionFunction): void;
    Before(options: HookOptions, fn: IHookDefinitionFunction): void;
    Before(tags: string, fn: IHookDefinitionFunction): void;
    defineStep(pattern: IStepDefinitionPattern, fn: IStepDefinitionFunction): void;
    defineStep(pattern: IStepDefinitionPattern, options: IStepDefinitionOptions, fn: IStepDefinitionFunction): void;
    Given(pattern: IStepDefinitionPattern, fn: IStepDefinitionFunction): void;
    Given(pattern: IStepDefinitionPattern, options: IStepDefinitionOptions, fn: IStepDefinitionFunction): void;
    registerHandler(eventName: string, fn: IHandlerFunction): void;
    registerHandler(eventName: string, options: IHandlerOptions, code: IHandlerFunction): void;
    setDefaultTimeout(milliseconds: number): void;
    setDefinitionFunctionWrapper(fn: IDefinitionWrapperFunction): void;
    setWorldConstructor(constructor: IWorld): void;
    Then(pattern: IStepDefinitionPattern, fn: IStepDefinitionFunction): void;
    Then(pattern: IStepDefinitionPattern, options: IStepDefinitionOptions, fn: IStepDefinitionFunction): void;
    When(pattern: IStepDefinitionPattern, fn: IStepDefinitionFunction): void;
    When(pattern: IStepDefinitionPattern, options: IStepDefinitionOptions, fn: IStepDefinitionFunction): void;
	}

  interface ITransformOptions {
    captureGroupRegexps: Array<RegExp>;
    transformer: (capture: string): any;
    typeName: string;
  }

  interface IHandlerOptions {
    timeout?: number;
  }

  interface IHandlerFunction {
    (object: any): void;
  }

  interface IDefinitionWrapperFunction {
    (fn: Function): Function;
  }

  interface IWorld {
    new(options?: IWorldOptions)
  }

  interface IWorldOptions {
    attach?: attach(data: Buffer | string | Stream, mimeType?: string, callback?: (err?: any) => void):void;
    parameters?: any;
  }

  interface IHookDefinitionOptions {
    tags?: string;
    timeout?: number;
  }

  interface IHookDefinitionFunction {
    (scenarioResult: any, callback?: StepDefinitionFunction.ICallbackParameter): void;
  }

  type StepDefinitionPattern = RegExp | string;

  interface IStepDefinitionOptions {
		timeout?: number;
	}

  interface IStepDefinitionFunction {
		(...parameters: Array<StepDefinitionFunction.IParameter>): PromiseLike<any> | any | void;
	}

  namespace StepDefinitionFunction {
    export interface CallbackParameter {
  		(error?: any, result?: any): void;
  	}

    export interface ITableParameter {
  		raw: () => Array<any>;
  		rows: () => Array<any>;
  		rowsHash: () => {};
  		hashes: () => {};
  	}

    type IParameter = any | CallbackParameter | TableParameter;
  }
}
