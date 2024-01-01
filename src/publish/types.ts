/**
 * Options relating to publication to https://reports.cucumber.io
 * @public
 */
export interface IPublishConfig {
  /**
   * Base URL for the Cucumber Reports service
   */
  url: string
  /**
   * Access token for the Cucumber Reports service
   */
  token: string
}
