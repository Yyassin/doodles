import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private module: string;
  private logLevel: LogLevel;

  constructor(module: string, logLevel: LogLevel = LogLevel.DEBUG) {
    this.module = module;
    this.logLevel = logLevel;
  }

  private getTime(): string {
    const now = new Date();
    // Include milliseconds
    return now.toISOString().slice(11, 23);
  }

  private logWithLevel(level: LogLevel, ...args: unknown[]): void {
    if (
      this.getLogLevelPriority(level) >= this.getLogLevelPriority(this.logLevel)
    ) {
      const timestamp = this.getTime();
      const coloredLevel = this.getColoredLevel(level);
      console.log(`[${timestamp}] [${this.module}] [${coloredLevel}]`, ...args);
    }
  }

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

  public setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
  }

  public debug(...args: unknown[]): void {
    this.logWithLevel(LogLevel.DEBUG, ...args);
  }

  public info(...args: unknown[]): void {
    this.logWithLevel(LogLevel.INFO, ...args);
  }

  public warn(...args: unknown[]): void {
    this.logWithLevel(LogLevel.WARN, ...args);
  }

  public error(...args: unknown[]): void {
    this.logWithLevel(LogLevel.ERROR, ...args);
  }

  public deriveLogger(subModule: string): Logger {
    const derivedModule = `${this.module}.${subModule}`;
    return new Logger(derivedModule, this.logLevel);
  }
}
