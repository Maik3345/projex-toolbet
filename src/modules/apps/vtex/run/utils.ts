import { ERROR_EXECUTION, ERROR_TO_EXCLUDE, SUCCESS_EXECUTION, log } from '@shared';
import { spawn } from 'child_process';

export const executeCommand = (commandToUse: string | undefined) => {
  if (!commandToUse) {
    throw new Error('no command to execute');
  }
  log.warn(`command to execute: ${commandToUse}`);
  childProcessRunCommandRun(commandToUse);
};

export const childProcessRunCommandRun = function (command: string) {
  const task = spawn(`${command}`, [], {
    shell: true,
  });

  const validateErrors = (data: any) => {
    const ignoreError = () => {
      let excludeError = false;

      ERROR_TO_EXCLUDE.map((exclude) => {
        if (data.toString('utf8').includes(exclude) && !excludeError) {
          log.debug('Ignore error', {
            data: data.toString('utf8'),
            exclude,
          });
          excludeError = true;
        }
      });
      return excludeError;
    };

    const checkErrors = () => {
      let haveError = false;

      ERROR_EXECUTION.map((item) => {
        if (data.toString('utf8').includes(item) && !haveError) {
          log.debug('Fail with error', {
            data: data.toString('utf8'),
            item,
          });
          haveError = true;
        }
      });
      return haveError;
    };

    let excludeError = ignoreError();

    if (excludeError) return;

    if (checkErrors()) {
      log.error(`finish with errors on run the command`);
      throw new Error('finish execution with errors');
    }
  };

  const validateSuccess = (data: any) => {
    SUCCESS_EXECUTION.map((success) => {
      if (data.toString('utf8').includes(success)) {
        log.info(`finish successfully on run the command when detect ${success}`);
        process.exit(0);
      }
    });
  };

  const acceptPrompt = () => {
    // simulating user input
    task.stdin.write('y\n');
  };

  // Método para imprimir el log normal
  task.stdout!.on('data', (data: any) => {
    console.log(data.toString('utf8'));
    validateErrors(data);
    validateSuccess(data);
    acceptPrompt();
  });

  // Método para imprimir el log de error
  task.stderr!.on('data', function (data: any) {
    console.log(data.toString('utf8'));
    validateErrors(data);
  });
};
