import { log } from '@shared';
import { executeCommand } from './utils';

let commandToUse = '';

export const vtexRunCommand = async function (command: string | undefined) {
  if (command === undefined) {
    return log.error('no command to execute');
  }

  // Capturo el flag para saber si empleo la ultima versión siempre o no.
  const SCAPECOMMAND = '--scape';
  const scapeCommand = process.argv.indexOf(SCAPECOMMAND) >= 0;
  commandToUse = command;

  if (scapeCommand) {
    commandToUse = command.replace(/\@S+/g, ' ');
    commandToUse = commandToUse.replace(/\@AND+/g, '&&');
  }

  log.warn(`command to execute: ${commandToUse}`);
  log.info('executing command...');
  executeCommand(commandToUse);
};
