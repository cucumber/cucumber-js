/**
 * Logger for emitting warnings, errors and debugging feedback from plugins
 * @beta
 */
export interface ILogger {
  /**
   * Log the given content at DEBUG level
   * @param content
   */
  debug: (...content: any[]) => void
  /**
   * Log the given content at ERROR level
   * @param content
   */
  error: (...content: any[]) => void
  /**
   * Log the given content at WARN level
   * @param content
   */
  warn: (...content: any[]) => void
}
