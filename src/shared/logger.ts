import { LogLevelColors } from '@api';
import { join } from 'path';
import { formatWithOptions } from 'util';
import { createLogger, format, transports } from 'winston';
import { LOGS_FOLDER } from './constants/paths';
import { isVerbose } from './verbose';
import chalk from 'chalk';

enum LogLevelIcons {
  'info' = '✔',
  'warn' = '▲',
  'error' = '✖',
  'debug' = 'i',
  'silly' = '✖',
  'verbose' = 'i',
}

const getLevelIcon = (level: string) => {
  const color = LogLevelColors[level as keyof typeof LogLevelColors];
  const icon = LogLevelIcons[level as keyof typeof LogLevelIcons];
  return icon ? chalk.hex(color)(icon) : '';
};

// The debug file is likely to be on ~/.config/configstore/pco_debug.txt
export const DEBUG_LOG_FILE_PATH = join(LOGS_FOLDER, 'debug.json');

const addArgs = format((info: any) => {
  // @ts-ignore
  const args: any[] = info[Symbol.for('splat')];
  info.args = args ? [...args] : [];
  return info;
});

const messageFormatter = format.printf((info: any) => {
  const { sender = '', message, args = [] } = info as any;
  const formattedMsgWithArgs = formatWithOptions({ colors: true }, message, ...args);
  const logIcon = getLevelIcon(info.level);
  const msg = `${logIcon} ${formattedMsgWithArgs}  ${chalk.gray(sender)}`;
  return msg;
});

export const consoleLoggerLevel = () => {
  return isVerbose ? 'debug' : 'info';
};

export const fileLoggerLevel = () => {
  return 'debug';
};

const isObject = (a: any) => {
  return !!a && a.constructor === Object;
};

// JSON.stringify doesn't get non-enumerable properties
// This is a workaround based on https://stackoverflow.com/a/18391400/11452359
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

// create formatter for dates used as timestamps  HH:mm:ss.SSS
// const tsFormat = () => chalk.whiteBright(moment().format("HH:mm").trim());

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
