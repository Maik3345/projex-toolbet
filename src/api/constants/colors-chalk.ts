import chalk from 'chalk';

export enum COLORS {
  GREEN = '#8fd19e',
  PINK = '#ffb6c1',
  BLUE = '#add8e6',
  ERROR = '#ff7f7f',
  WHITE = '#ffffff',
  YELLOW = '#fffacd',
  WARNING_TERMINAL = '#e6e6fa',
}

export enum LogLevelColors {
  'info' = COLORS.GREEN,
  'warn' = COLORS.WARNING_TERMINAL,
  'error' = COLORS.ERROR,
  'debug' = COLORS.BLUE,
  'silly' = COLORS.YELLOW,
  'verbose' = COLORS.BLUE,
}

export class Colors {
  public static readonly WARNING = (message: string) => chalk.hex(COLORS.WARNING_TERMINAL)(message);
  public static readonly ERROR = (message: string) => chalk.hex(COLORS.ERROR)(message);
  public static readonly WHITE = (message: string) => chalk.hex(COLORS.WHITE)(message);
  public static readonly YELLOW = (message: string) => chalk.hex(COLORS.YELLOW)(message);
  public static readonly PINK = (message: string) => chalk.hex(COLORS.PINK)(message);
  public static readonly GREEN = (message: string) => chalk.hex(COLORS.GREEN)(message);
  public static readonly BLUE = (message: string) => chalk.hex(COLORS.BLUE)(message);
}
