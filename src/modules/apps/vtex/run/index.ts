import { log } from '@shared';
import { executeCommand } from './utils';

let commandToUse = '';

/**
 * Executes a given VTEX CLI command, with optional command string transformations
 * based on the presence of the `--scape` flag in the process arguments.
 *
 * - If no command is provided, logs an error and returns.
 * - If the `--scape` flag is present, replaces occurrences of `@S+` with a space
 *   and `@AND+` with `&&` in the command string.
 * - Logs the command to be executed and then executes it.
 *
 * @param command - The VTEX CLI command string to execute. If `undefined`, the function logs an error and returns.
 */
export const vtexRunCommand = async function (command: string | undefined) {
  if (command === undefined) {
    log.error('❌ No command provided. Please specify a VTEX command to run.');
    log.info('💡 Tip: Example usage: projex vtex run "vtex whoami"');
    return;
  }

  // Capturo el flag para saber si empleo la ultima versión siempre o no.
  const SCAPECOMMAND = '--scape';
  const scapeCommand = process.argv.indexOf(SCAPECOMMAND) >= 0;
  commandToUse = command;

  if (scapeCommand) {
    commandToUse = command.replace(/@S+/g, ' ');
    commandToUse = commandToUse.replace(/@AND+/g, '&&');
  }

  log.warn(`⚡ Command to execute: ${commandToUse}`);
  log.info('🚀 Executing command...');
  executeCommand(commandToUse);
};
