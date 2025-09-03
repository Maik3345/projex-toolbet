import { Colors } from '@api';
import { formatWithOptions } from 'util';
import { LOG_LEVELS, LogLevelName } from './levels';
import { format } from 'winston';

/**
 * Extrae argumentos adicionales del objeto de log
 *
 * @returns Un formateador de Winston que añade los argumentos al objeto info
 */
export const addArgs: any = () => {
  return format((info: any) => {
    const args: any[] = info[Symbol.for('splat')];
    info.args = args ? [...args] : [];
    return info;
  })();
};

/**
 * Formatea un valor para mostrarlo en logs
 */
export const prettyPrint = (value: any): string => {
  if (typeof value === 'object' && value !== null) {
    return Colors.CYAN(JSON.stringify(value, null, 2));
  }
  return String(value);
};

/**
 * Formateador principal para logs en consola
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const consoleFormatter: any = format.printf(
  // Usamos type assertion explícito para evitar error de inferencia de tipos
  (info: any) => {
    const { level, sender = '', message, args = [] } = info;
    const logLevel = level as LogLevelName;
    const levelConfig = LOG_LEVELS[logLevel];

    // Formatear argumentos
    const formattedArgs = args.map(prettyPrint);

    // Crear el mensaje combinado
    const formattedMsgWithArgs = formatWithOptions({ colors: true }, message, ...formattedArgs);

    // Colorear el ícono del nivel
    const logIcon = Colors.colorize(levelConfig.color, levelConfig.icon);

    // Formar el mensaje final
    const colorizedMsg = Colors.colorize(levelConfig.color, `${logIcon} ${formattedMsgWithArgs}`);

    // Añadir el remitente si existe
    const finalMsg = colorizedMsg + (sender ? `  ${Colors.GREY(sender)}` : '');

    return finalMsg;
  },
);

/**
 * Determina si el valor proporcionado es un objeto plano
 */
export const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object' && value.constructor === Object;
};

/**
 * Reemplaza objetos Error para formato JSON
 */
export const errorJsonReplacer = (key: any, value: any) => {
  // Lógica para manejar errores en JSON
  if (key === '' && isObject(value) && value.args != null) {
    value.args = value.args.map((arg: any) => {
      if (arg instanceof Error) {
        const error: Record<string, any> = {};
        Object.getOwnPropertyNames(arg).forEach((objKey) => {
          error[objKey] = (arg as any)[objKey];
        });
        return error;
      }
      return arg;
    });
  }
  return value;
};
