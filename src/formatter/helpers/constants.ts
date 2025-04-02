export const LOCAL = {
  SSO: 'http://localhost:5000/api/auth',
  WORKSPACE: 'http://localhost:6000/api/workspace',
  RUNS: 'http://localhost:5001/api/runs',
  STORAGE: 'http://localhost:5050/api/storage',
}
export const DEV = {
  SSO: 'https://dev.api.blinq.io/api/auth',
  WORKSPACE: 'https://dev.api.blinq.io/api/workspace',
  RUNS: 'https://dev.api.blinq.io/api/runs',
  STORAGE: 'https://dev.api.blinq.io/api/storage',
}
export const PROD = {
  SSO: 'https://api.blinq.io/api/auth',
  WORKSPACE: 'https://api.blinq.io/api/workspace',
  RUNS: 'https://api.blinq.io/api/runs',
  STORAGE: 'https://api.blinq.io/api/storage',
}
export const STAGE = {
  SSO: 'https://stage.api.blinq.io/api/auth',
  WORKSPACE: 'https://stage.api.blinq.io/api/workspace',
  RUNS: 'https://stage.api.blinq.io/api/runs',
  STORAGE: 'https://stage.api.blinq.io/api/storage',
}

export const CUSTOM = {
  SSO: `${process.env.NODE_ENV_BLINQ}/api/auth`,
  WORKSPACE: `${process.env.NODE_ENV_BLINQ}/api/workspace`,
  RUNS: `${process.env.NODE_ENV_BLINQ}/api/runs`,
  STORAGE: `${process.env.NODE_ENV_BLINQ}/api/storage`,
}

export const SERVICES_URI =
  process.env.NODE_ENV_BLINQ === 'local'
    ? LOCAL // eslint-disable-line
    : process.env.NODE_ENV_BLINQ === 'dev'
    ? DEV // eslint-disable-line
    : process.env.NODE_ENV_BLINQ === 'stage'
    ? STAGE // eslint-disable-line
    : process.env.NODE_ENV_BLINQ === 'prod'
    ? PROD // eslint-disable-line
    : !process.env.NODE_ENV_BLINQ
    ? PROD // eslint-disable-line
    : CUSTOM // eslint-disable-line

export enum ActionEvents {
  record_scenario = 'record_scenario',
  download_editor = 'download_editor',
  launch_editor = 'launch_editor',
  click_start_recording = 'click_start_recording',
  click_run_scenario = 'click_run_scenario',
  publish_scenario = 'publish_scenario',
  click_ai_generate = 'click_ai_generate',
  click_run_all = 'click_run_all',
  click_open_vscode = 'click_open_vscode',
  error_open_vscode = 'error_open_vscode',
  cli_run_tests = 'cli_run_tests',
  upload_report = 'upload_report',
}
