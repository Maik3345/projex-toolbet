import { log } from '../logger';
import { spawn } from 'child_process';

/**
 * Executes a shell command and logs its output and errors.
 *
 * @param command - The shell command to execute.
 * @param errors - An optional array of error strings to watch for in stderr output. If any are detected, the process will exit with code 1.
 * @returns A promise that resolves with the string 'exit' when the command completes.
 *
 * @remarks
 * - Standard output is logged as informational messages.
 * - Standard error is logged as warnings. If any of the specified error strings are found in the error output, a critical error is logged and the process exits.
 * - Uses Node.js `spawn` with `shell: true`.
 */
export const runMultipleCommand = (command: string, errors?: Array<string>): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    task.stdout.on('data', (data: string) => {
      log.info(`ℹ️ ${data.toString()}`);
    });

    task.on('exit', () => {
      resolve('exit');
    });

    task.stderr.on('data', (data: string) => {
      log.warn(`⚠️ ${data.toString()}`);

      if (errors) {
        errors.forEach((item: string) => {
          if (data.toString().includes(item)) {
            log.error('❌ Critical error detected.');
            log.info('💡 Tip: Review the error message above and check your command or environment.');
            process.exit(1);
          }
        });
      }
    });
  });
};
