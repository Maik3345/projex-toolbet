import { join } from 'path';
import { transports, format } from 'winston';
import { LOGS_FOLDER } from '../constants/paths';
import { errorJsonReplacer, consoleFormatter } from './formatters';

// Path para el archivo de logs
export const DEBUG_LOG_FILE_PATH = join(LOGS_FOLDER, 'debug.json');

/**
 * Crea un transport para salida en consola
 * 
 * @param level Nivel de log para este transport
 * @returns Transport configurado para consola
 */
export const createConsoleTransport = (level: string) => {
  return new transports.Console({
    format: consoleFormatter,
    level,
  });
};

/**
 * Crea un transport para salida en archivo
 * 
 * @param level Nivel de log para este transport
 * @param filename Ruta del archivo de logs
 * @returns Transport configurado para archivo
 */
export const createFileTransport = (level: string, filename: string = DEBUG_LOG_FILE_PATH) => {
  return new transports.File({
    filename,
    format: format.combine(
      format.json({ replacer: errorJsonReplacer, space: 2 })
    ),
    level,
    maxsize: 5e6, // 5MB
    maxFiles: 2,
    tailable: true,
    zippedArchive: true,
  });
};

/**
 * Crea un transport para logs específicos de errores
 * 
 * @returns Transport configurado para errores
 */
export const createErrorFileTransport = () => {
  return new transports.File({
    filename: join(LOGS_FOLDER, 'error.json'),
    format: format.combine(
      format.json({ replacer: errorJsonReplacer, space: 2 })
    ),
    level: 'error',
    maxsize: 1e6, // 1MB
    maxFiles: 5,
    tailable: true,
    zippedArchive: true,
  });
};
