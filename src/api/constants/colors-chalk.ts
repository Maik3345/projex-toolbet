import chalk from 'chalk';

// Pastel color palette for CLI
export enum COLORS {
  GREEN = '#A8E6CF', // Pastel green
  PINK = '#FFB5E8', // Pastel pink
  BLUE = '#A0C4FF', // Pastel blue
  ERROR = '#FF8B94', // Pastel red
  WHITE = '#F8F9FA', // Very light
  YELLOW = '#FFFACD', // Pastel yellow
  WARNING_TERMINAL = '#FFD6A5', // Pastel orange/amber
  ORANGE = '#FFDAC1', // Pastel orange
  PURPLE = '#BDB2FF', // Pastel purple
  CYAN = '#B2F7EF', // Pastel cyan
  GREY = '#D3D3D3', // Pastel grey
}

// Utility class to apply colors
export class Colors {
  public static readonly WARNING = (message: string) => chalk.hex(COLORS.WARNING_TERMINAL)(message);
  public static readonly ERROR = (message: string) => chalk.hex(COLORS.ERROR)(message);
  public static readonly WHITE = (message: string) => chalk.hex(COLORS.WHITE)(message);
  public static readonly YELLOW = (message: string) => chalk.hex(COLORS.YELLOW)(message);
  public static readonly PINK = (message: string) => chalk.hex(COLORS.PINK)(message);
  public static readonly GREEN = (message: string) => chalk.hex(COLORS.GREEN)(message);
  public static readonly BLUE = (message: string) => chalk.hex(COLORS.BLUE)(message);
  public static readonly ORANGE = (message: string) => chalk.hex(COLORS.ORANGE)(message);
  public static readonly PURPLE = (message: string) => chalk.hex(COLORS.PURPLE)(message);
  public static readonly CYAN = (message: string) => chalk.hex(COLORS.CYAN)(message);
  public static readonly GREY = (message: string) => chalk.hex(COLORS.GREY)(message);
}
