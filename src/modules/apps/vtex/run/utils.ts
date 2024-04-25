import { ERROR_EXECUTION, ERROR_TO_EXCLUDE, log } from '@shared';
import { spawn } from 'child_process';
const _ = require('lodash');

export const executeCommand = (commandToUse: string | undefined) => {
  if (!commandToUse) {
    throw new Error('no command to execute');
  }
  log.warn(`command to execute: ${commandToUse}`);
  childProcessRunCommandRun(commandToUse);
};

const debouncedError = _.debounce(() => {
  log.error(`finish with errors on run the command`);
  throw new Error('finish execution with errors');
}, 20000);

const debouncedSuccess = _.debounce(() => {
  log.info(`finish successfully on run the command`);
  process.exit(0);
}, 20000);

export const childProcessRunCommandRun = function (command: string) {
  const task = spawn(`${command}`, [], {
    shell: true,
  });

  const validateErrors = (data: any) => {
    ERROR_EXECUTION.map((item) => {
      ERROR_TO_EXCLUDE.map((exclude) => {
        if (data.toString('utf8').includes(item) && !data.toString('utf8').includes(exclude)) {
          debouncedError.cancel();
          debouncedError();
        }
      });
    });
  };

  const validateSuccess = () => {
    debouncedSuccess.cancel();
    debouncedSuccess();
  };

  const acceptPrompt = () => {
    // simulating user input
    task.stdin.write('y\n');
  };

  // Método para imprimir el log normal
  task.stdout!.on('data', (data: any) => {
    console.log(data.toString('utf8'));
    validateErrors(data);
    validateSuccess();
    acceptPrompt();
  });

  // Método para imprimir el log de error
  task.stderr!.on('data', function (data: any) {
    console.log(data.toString('utf8'));
    validateErrors(data);
  });
};
