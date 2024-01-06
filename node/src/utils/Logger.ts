import chalk from 'chalk';

/**
 * Provides a logging utility with various log levels and colored output.
 * @author Yousef Yassin
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Manages logging with different log levels and colored output.
 */
export class Logger {
  private module: string;
  private logLevel: LogLevel;

  /**
   * Creates a new Logger instance with the specified module name and log level.
   * @param module The module name to be displayed in the log, as a prefix.
   * @param logLevel The log level to be used, log below this level will be ignored.
   */
  constructor(module: string, logLevel: LogLevel = LogLevel.DEBUG) {
    this.module = module;
    this.logLevel = logLevel;
  }

  /**
   * Gets the current time as a formatted string.
   * @returns The formatted time string.
   */
  private getTime(): string {
    const now = new Date();
    // Include milliseconds
    return now.toISOString().slice(11, 23);
  }

  /**
   * Logs a message with the specified log level.
   * @param level The log level.
   * @param args The log message arguments.
   */
  private logWithLevel(level: LogLevel, ...args: unknown[]): void {
    if (
      this.getLogLevelPriority(level) >= this.getLogLevelPriority(this.logLevel)
    ) {
      const timestamp = this.getTime();
      const coloredLevel = this.getColoredLevel(level);
      console.log(`[${timestamp}] [${this.module}] [${coloredLevel}]`, ...args);
    }
  }

  /**
   * Gets the priority of a log level for comparison.
   * @param level The log level.
   * @returns The priority value.
   */
  private getLogLevelPriority(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG:
        return 0;
      case LogLevel.INFO:
        return 1;
      case LogLevel.WARN:
        return 2;
      case LogLevel.ERROR:
        return 3;
      default:
        return -1;
    }
  }

  /**
   * Gets the colored representation of a log level.
   * @param level The log level.
   * @returns The colored log level string.
   */
  private getColoredLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return chalk.gray(level);
      case LogLevel.INFO:
        return chalk.green(level);
      case LogLevel.WARN:
        return chalk.yellow(level);
      case LogLevel.ERROR:
        return chalk.red(level);
      default:
        return level;
    }
  }

  /**
   * Sets the log level for the logger.
   * @param logLevel The new log level.
   */
  public setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
  }

  /**
   * Logs a debug message.
   * @param args The log message arguments.
   */
  public debug(...args: unknown[]): void {
    this.logWithLevel(LogLevel.DEBUG, ...args);
  }

  /**
   * Logs an info message.
   * @param args The log message arguments.
   */
  public info(...args: unknown[]): void {
    this.logWithLevel(LogLevel.INFO, ...args);
  }

  /**
   * Logs an warn message.
   * @param args The log message arguments.
   */
  public warn(...args: unknown[]): void {
    this.logWithLevel(LogLevel.WARN, ...args);
  }

  /**
   * Logs an error message.
   * @param args The log message arguments.
   */
  public error(...args: unknown[]): void {
    this.logWithLevel(LogLevel.ERROR, ...args);
  }

  /**
   * Derives a new logger instance with an extended module name.
   * @param subModuleThe sub-module name to be appended.
   * @returns The derived logger instance.
   */
  public deriveLogger(subModule: string): Logger {
    const derivedModule = `${this.module}.${subModule}`;
    return new Logger(derivedModule, this.logLevel);
  }
}
