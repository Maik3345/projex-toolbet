import { spawn } from 'child_process';
import { log } from '../logger';

/**
 * Executes a shell command and returns its standard output as a Promise.
 *
 * @param command - The shell command to execute.
 * @returns A Promise that resolves with the command's standard output as a string.
 *
 * @remarks
 * - The function logs the command's output using `log.debug`.
 * - If the command produces an error output, it logs the error and exits the process.
 * - Only the first chunk of standard output will resolve the Promise; subsequent output is ignored.
 *
 * @example
 * ```typescript
 * const output = await runOnlyCommand('ls -la');
 * console.log(output);
 * ```
 */
export const runOnlyCommand = (command: string): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    task.stdout.on('data', (data: string) => {
      log.debug(data.toString());
      resolve(data.toString());
    });

    task.stderr.on('data', function (data: string) {
      log.error(`❌ Error running the command: ${command}`);
      log.error(data.toString());
      log.info('💡 Tip: Check the command syntax and your environment variables.');
      process.exit(1);
    });
  });
};
