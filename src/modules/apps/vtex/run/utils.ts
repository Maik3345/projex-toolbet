import { ERROR_EXECUTION, ERROR_TO_EXCLUDE, SUCCESS_EXECUTION, log } from '@shared';
import { spawn } from 'child_process';

/**
 * Executes a given shell command using a child process.
 *
 * @param commandToUse - The command string to execute. If undefined, an error is thrown.
 * @throws Will throw an error if `commandToUse` is not provided.
 */
export const executeCommand = (commandToUse: string | undefined) => {
  if (!commandToUse) {
    log.error('❌ No command provided.');
    log.info('💡 Tip: Please specify a VTEX command to run.');
    return;
  }
  log.warn(`⚡ Command to execute: ${commandToUse}`);
  log.info('🚀 Executing command...');
  childProcessRunCommandRun(commandToUse);
};

/**
 * Executes a shell command as a child process and handles its output streams.
 *
 * This function spawns a new child process to run the specified command using the system shell.
 * It listens to the process's stdout and stderr streams, performing the following actions:
 * - Validates output for known errors and excludes certain errors from logging.
 * - Logs and throws an error if a critical error is detected after a delay.
 * - Detects successful execution based on predefined success messages and exits the process.
 * - Simulates user input by writing 'y' to the process's stdin (useful for prompts).
 *
 * @param command - The shell command to execute.
 *
 * @remarks
 * The function relies on external constants (`ERROR_TO_EXCLUDE`, `ERROR_EXECUTION`, `SUCCESS_EXECUTION`)
 * and a `log` object for logging. It is designed for interactive command-line tools that may prompt for user input.
 *
 * @throws {Error} Throws an error if a critical execution error is detected in the output.
 */
export const childProcessRunCommandRun = function (command: string) {
  const task = spawn(`${command}`, [], {
    shell: true,
  });

  /**
   * Validates the provided error data against predefined exclusion and execution error lists.
   *
   * - If the error data matches any entry in `ERROR_TO_EXCLUDE`, the error is ignored and no further action is taken.
   * - If the error data matches any entry in `ERROR_EXECUTION` (and is not excluded), logs an error and throws an exception after a delay.
   *
   * @param data - The error data to validate, typically a Buffer or string containing error output.
   *
   * @remarks
   * This function is intended to be used for filtering and handling error messages during command execution.
   * It relies on the global `ERROR_TO_EXCLUDE` and `ERROR_EXECUTION` arrays, as well as a `log` object for logging.
   */
  const validateErrors = (data: any) => {
    const ignoreError = () => {
      let excludeError = false;

      ERROR_TO_EXCLUDE.forEach((exclude) => {
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

    /**
     * Checks if any of the predefined error messages in `ERROR_EXECUTION` are present
     * in the `data` buffer (converted to UTF-8 string). Logs debug information for the
     * first matched error and returns a boolean indicating whether an error was found.
     *
     * @returns {boolean} `true` if any error message is found in the data; otherwise, `false`.
     */
    const checkErrors = () => {
      let haveError = false;

      ERROR_EXECUTION.forEach((item) => {
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
      setTimeout(() => {
        log.error('❌ Finished with errors while running the command.');
        log.info('💡 Tip: Review the error message above and check your command or environment.');
        throw new Error('finish execution with errors');
      }, 5000);
    }
  };

  /**
   * Checks if the provided data contains any of the predefined success messages.
   * If a success message is found, logs an informational message and exits the process with code 0.
   *
   * @param data - The data to be checked, expected to be a Buffer or an object that can be converted to a UTF-8 string.
   */
  const validateSuccess = (data: any) => {
    SUCCESS_EXECUTION.forEach((success) => {
      if (data.toString('utf8').includes(success)) {
        log.info(`✅ Finished successfully when detected: ${success}`);
        process.exit(0);
      }
    });
  };

  /**
   * Simulates user input by writing 'y' followed by a newline character to the standard input of the given task.
   * Typically used to automatically accept prompts that require a 'yes' confirmation.
   */
  const acceptPrompt = () => {
    // simulating user input
    task.stdin.write('y\n');
  };

  task.stdout.on('data', (data: any) => {
    console.log(data.toString('utf8'));
    validateErrors(data);
    validateSuccess(data);
    acceptPrompt();
  });

  task.stderr.on('data', function (data: any) {
    console.log(data.toString('utf8'));
    validateErrors(data);
  });
};
