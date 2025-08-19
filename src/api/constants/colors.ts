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
  public static colorize(hex: string, message: string) {
    // colorette no soporta hex directo, así que usamos ANSI escape
    return `\x1b[38;2;${parseInt(hex.slice(1, 3), 16)};${parseInt(hex.slice(3, 5), 16)};${parseInt(
      hex.slice(5, 7),
      16,
    )}m${message}\x1b[0m`;
  }

  public static readonly WARNING = (message: string) => Colors.colorize(COLORS.WARNING_TERMINAL, message);
  public static readonly ERROR = (message: string) => Colors.colorize(COLORS.ERROR, message);
  public static readonly WHITE = (message: string) => Colors.colorize(COLORS.WHITE, message);
  public static readonly YELLOW = (message: string) => Colors.colorize(COLORS.YELLOW, message);
  public static readonly PINK = (message: string) => Colors.colorize(COLORS.PINK, message);
  public static readonly GREEN = (message: string) => Colors.colorize(COLORS.GREEN, message);
  public static readonly BLUE = (message: string) => Colors.colorize(COLORS.BLUE, message);
  public static readonly ORANGE = (message: string) => Colors.colorize(COLORS.ORANGE, message);
  public static readonly PURPLE = (message: string) => Colors.colorize(COLORS.PURPLE, message);
  public static readonly CYAN = (message: string) => Colors.colorize(COLORS.CYAN, message);
  public static readonly GREY = (message: string) => Colors.colorize(COLORS.GREY, message);
}
