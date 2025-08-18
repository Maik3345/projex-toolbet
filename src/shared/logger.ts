import { COLORS, Colors } from '@api';
import { join } from 'path';
import { formatWithOptions } from 'util';
import { createLogger, format, transports } from 'winston';
import { LOGS_FOLDER } from './constants/paths';
import { isVerbose } from './verbose';

enum LogLevelIcons {
  'info' = '✔',
  'warn' = '▲',
  'error' = '✖',
  'debug' = 'i',
  'silly' = '✖',
  'verbose' = 'i',
}

/**
 * Returns a colored icon representing the specified log level.
 *
 * Looks up the icon and color associated with the provided log level,
 * and returns the icon string styled with the corresponding color using ANSI escapes.
 * If the log level is not recognized, returns an empty string.
 *
 * @param level - The log level as a string (e.g., "info", "error", "warn").
 * @returns The colored icon string for the log level, or an empty string if not found.
 */
// Mapeo simple de nivel de log a color pastel
const levelColorMap: Record<string, string> = {
  info: COLORS.GREEN,
  warn: COLORS.WARNING_TERMINAL,
  error: COLORS.ERROR,
  debug: COLORS.CYAN,
  silly: COLORS.PURPLE,
  verbose: COLORS.BLUE,
};

const getLevelIcon = (level: string) => {
  const color = levelColorMap[level] || COLORS.GREY;
  const icon = LogLevelIcons[level as keyof typeof LogLevelIcons];
  return icon ? Colors.colorize(color, icon) : '';
};

// The debug file is likely to be on ~/.config/configstore/debug.json
export const DEBUG_LOG_FILE_PATH = join(LOGS_FOLDER, 'debug.json');

/**
 * A Winston format function that extracts additional arguments (splat) from the log info object
 * and assigns them to an `args` property on the info object.
 *
 * This is useful for capturing extra parameters passed to logger methods (e.g., logger.info('msg', arg1, arg2)).
 *
 * @param info - The log info object provided by Winston.
 * @returns The modified info object with an `args` property containing the extracted arguments.
 */
const addArgs = format((info: any) => {
  // @ts-ignore
  const args: any[] = info[Symbol.for('splat')];
  info.args = args ? [...args] : [];
  return info;
});

/**
 * Custom log message formatter for Winston logger.
 *
 * Formats log messages by injecting a level-specific icon, formatting the message with optional arguments,
 * and appending the sender information in gray color.
 *
 * @param info - The log information object, expected to contain `level`, `message`, `args`, and optional `sender`.
 * @returns The formatted log message string.
 */
// Helper to colorize the full message by log level
const colorizeByLevel = (level: string, text: string) => {
  const color = levelColorMap[level] || COLORS.GREY;
  return Colors.colorize(color, text);
};

// Helper to pretty-print objects/arrays with color and multiline
const prettyPrint = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return Colors.CYAN(JSON.stringify(value, null, 2));
  }
  return value;
};

// Option to output logs as JSON (for integration/monitoring)
const LOG_AS_JSON = process.env.LOG_AS_JSON === 'true';

const messageFormatter = format.printf((info: any) => {
  const { sender = '', message, args = [] } = info;
  if (LOG_AS_JSON) {
    // Structured JSON output for console
    return JSON.stringify(
      {
        level: info.level,
        icon: getLevelIcon(info.level),
        message,
        args,
        sender,
        timestamp: info.timestamp,
      },
      null,
      2,
    );
  }
  // Colorize and pretty-print objects/arrays in args
  const formattedArgs = args.map(prettyPrint);
  const formattedMsgWithArgs = formatWithOptions({ colors: true }, message, ...formattedArgs);
  const logIcon = getLevelIcon(info.level);
  // Colorize the full message by level
  const msg =
    colorizeByLevel(info.level, `${logIcon} ${formattedMsgWithArgs}`) + (sender ? `  ${Colors.GREY(sender)}` : '');
  return msg;
});

/**
 * Determines the logging level for the console logger based on the `isVerbose` flag.
 *
 * @returns {'debug' | 'info'} Returns `'debug'` if verbose mode is enabled, otherwise `'info'`.
 */
// Allow log level by environment (LOG_LEVEL=warn, etc)
export const consoleLoggerLevel = () => {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  return isVerbose ? 'debug' : 'info';
};

/**
 * Returns the log level to be used for file logging.
 *
 * @returns {'debug'} The log level string for file logging.
 */
export const fileLoggerLevel = () => {
  return 'debug';
};

/**
 * Determines if the provided value is a plain JavaScript object.
 *
 * @param a - The value to check.
 * @returns `true` if the value is a non-null object created by the `Object` constructor, otherwise `false`.
 */
const isObject = (a: any) => {
  return !!a && a.constructor === Object;
};

/**
 * A JSON replacer function designed to serialize objects containing Error instances within an `args` property.
 *
 * When serializing an object whose root has an `args` property (typically an array), this replacer will
 * convert any Error instances within `args` into plain objects by copying all own properties of the Error.
 * This ensures that error details are preserved in the resulting JSON output, as Error objects are not
 * serialized by default.
 *
 * @param key - The current property key being processed during JSON serialization.
 * @param value - The current property value being processed.
 * @returns The processed value, with Error instances in `args` replaced by plain objects.
 */
const errorJsonReplacer = (key: any, value: any) => {
  if (key === '' && isObject(value) && value.args != null) {
    value.args = value.args.map((arg: any) => {
      if (arg instanceof Error) {
        const error = {};
        Object.getOwnPropertyNames(arg).forEach((objKey) => {
          // @ts-ignore
          error[objKey] = arg[objKey];
        });
        return error;
      }

      return arg;
    });
  }

  return value;
};

/**
 * Creates and configures a Winston logger instance with both console and file transports.
 *
 * The logger uses a custom argument adder and timestamp formatting for all logs.
 * - Console transport: Uses a custom message formatter and dynamic log level.
 * - File transport: Writes logs in JSON format with custom error serialization, dynamic log level,
 *   a maximum file size of 5MB, and keeps up to 2 log files.
 *
 * @remarks
 * The logger configuration relies on several helper functions and constants:
 * - `addArgs()`: Adds custom arguments to log entries.
 * - `messageFormatter`: Formats log messages for the console.
 * - `consoleLoggerLevel()`: Determines the log level for the console transport.
 * - `fileLoggerLevel()`: Determines the log level for the file transport.
 * - `DEBUG_LOG_FILE_PATH`: Path to the debug log file.
 * - `errorJsonReplacer`: Custom replacer for serializing errors in JSON logs.
 *
 * @public
 */
const logger = createLogger({
  format: format.combine(addArgs(), format.timestamp({ format: 'HH:mm:ss.SSS' })),
  transports: [
    new transports.Console({
      format: messageFormatter,
      level: consoleLoggerLevel(),
    }),
    new transports.File({
      filename: DEBUG_LOG_FILE_PATH,
      format: format.combine(format.json({ replacer: errorJsonReplacer, space: 2 })),
      level: fileLoggerLevel(),
      maxsize: 5e6,
      maxFiles: 2,
    }),
  ],
});

const levels = ['debug', 'info', 'error', 'warn', 'verbose', 'silly'];
levels.forEach((level: any) => {
  // @ts-ignore
  logger[level] = (msg: any, ...remains: any[]) => {
    if (remains.length > 0 && isObject(remains[0]) && remains[0].message) {
      msg = `${msg}`;
    }

    if (typeof msg !== 'string') {
      return logger.log(level, '', msg, ...remains);
    }

    logger.log(level, msg, ...remains);
  };
});

logger.on('error', (err) => {
  console.error('A problem occurred with the logger:');
  console.error(err);
});

logger.on('finish', (info: any) => {
  console.log(`Logging has finished: ${info}`);
});

export const log = logger;
