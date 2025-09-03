// Mapeo de niveles de log a nombres para CLI
export const LOG_LEVEL_NAMES = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
  debug: 'DEBUG',
  verbose: 'VERBOSE',
  silly: 'SILLY',
};

// Opciones para formateo de fecha en logs
export const TIMESTAMP_FORMATS = {
  DEFAULT: 'YYYY-MM-DD HH:mm:ss.SSS',
  COMPACT: 'YY-MM-DD HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss.SSS',
  ISO: undefined, // Usa formato ISO estándar
};

// Modos de formato disponibles
export enum LogFormat {
  PRETTY = 'pretty',
  JSON = 'json',
  MINIMAL = 'minimal',
}
