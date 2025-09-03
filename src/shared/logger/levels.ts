import { COLORS } from '@api';

// Definición de niveles de log con sus metadatos
export interface LogLevel {
  priority: number;
  color: string;
  icon: string;
}

// Niveles de log disponibles
export type LogLevelName = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

// Mapa de niveles con sus propiedades
export const LOG_LEVELS: Record<LogLevelName, LogLevel> = {
  error: {
    priority: 0,
    color: COLORS.ERROR,
    icon: '✖',
  },
  warn: {
    priority: 1,
    color: COLORS.WARNING_TERMINAL,
    icon: '▲',
  },
  info: {
    priority: 2,
    color: COLORS.GREEN,
    icon: '✔',
  },
  debug: {
    priority: 3,
    color: COLORS.CYAN,
    icon: 'i',
  },
  verbose: {
    priority: 4,
    color: COLORS.BLUE,
    icon: 'i',
  },
  silly: {
    priority: 5,
    color: COLORS.PURPLE,
    icon: '✖',
  },
};

/**
 * Determina el nivel de log basado en el modo verbose y posibles overrides
 * 
 * @param isVerbose Flag que indica si el modo verbose está activado
 * @param envOverride Posible override desde variables de entorno
 * @returns El nivel de log a utilizar
 */
export function getLogLevel(isVerbose: boolean, envOverride?: string): LogLevelName {
  // Si hay un override desde variables de entorno, usarlo
  if (envOverride && envOverride in LOG_LEVELS) {
    return envOverride as LogLevelName;
  }
  
  // Por defecto, basado en el modo verbose
  return isVerbose ? 'debug' : 'info';
}
