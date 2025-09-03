import { createLogger, format } from 'winston';
import { isVerbose } from '../verbose';
import { addArgs, isObject } from './formatters';
import { getLogLevel, LogLevelName } from './levels';
import { createConsoleTransport, createFileTransport, createErrorFileTransport } from './transports';

// Niveles de log para diferentes destinos
const consoleLevel = getLogLevel(isVerbose, process.env.LOG_LEVEL);
const fileLevel = 'debug'; // Guardamos todos los niveles en archivo para debugging

/**
 * Logger principal del sistema
 * Configurado con múltiples transports y formatos personalizados
 */
const logger = createLogger({
  format: format.combine(
    addArgs(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })
  ),
  transports: [
    createConsoleTransport(consoleLevel),
    createFileTransport(fileLevel),
    createErrorFileTransport(),
  ],
});

// Sobreescribir métodos para manejar mejor los objetos
const levels: LogLevelName[] = ['debug', 'info', 'error', 'warn', 'verbose', 'silly'];
levels.forEach((level) => {
  // @ts-ignore
  logger[level] = (msg: any, ...args: any[]) => {
    // Si el primer argumento después del mensaje es un objeto con propiedad 'message',
    // considera que podría ser un error o un objeto especial
    if (args.length > 0 && 
        isObject(args[0]) && 
        'message' in args[0]) {
      msg = `${msg}`;
    }

    // Si el mensaje no es un string, trátalo como un argumento
    if (typeof msg !== 'string') {
      return logger.log(level, '', msg, ...args);
    }

    logger.log(level, msg, ...args);
  };
});

// Manejadores de eventos del logger
logger.on('error', (err) => {
  console.error('Error en el sistema de logs:');
  console.error(err);
});

/**
 * Logger principal de la aplicación
 */
export const log = logger;

/**
 * Cambia el nivel de log de todos los transports
 * 
 * @param level Nuevo nivel de log
 */
export function setLogLevel(level: string) {
  logger.transports.forEach((transport) => {
    transport.level = level;
  });
}

// Exportaciones adicionales para uso avanzado
export * from './levels';
export * from './formatters';
export * from './transports';
export * from './constants';
