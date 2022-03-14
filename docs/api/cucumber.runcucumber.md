<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@cucumber/cucumber](./cucumber.md) &gt; [runCucumber](./cucumber.runcucumber.md)

## runCucumber() function

<b>Signature:</b>

```typescript
export declare function runCucumber(configuration: IRunConfiguration, { cwd, stdout, stderr, env, }: Partial<IRunEnvironment>, onMessage?: (message: Envelope) => void): Promise<IRunResult>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  configuration | IRunConfiguration |  |
|  { cwd, stdout, stderr, env, } | Partial&lt;[IRunEnvironment](./cucumber.irunenvironment.md)<!-- -->&gt; |  |
|  onMessage | (message: Envelope) =&gt; void |  |

<b>Returns:</b>

Promise&lt;[IRunResult](./cucumber.irunresult.md)<!-- -->&gt;
