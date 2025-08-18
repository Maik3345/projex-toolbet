const cp = require('child-process-es6-promise');
import { Colors } from '@api';
import { log } from '../logger';

/**
 * Executes a shell command synchronously in a specified working directory, with optional output control, retries, and logging.
 *
 * @param cmd - The shell command to execute.
 * @param cwd - The current working directory in which to run the command.
 * @param successMessage - A message to display upon successful execution.
 * @param hideOutput - If true, suppresses the command output; otherwise, outputs to the console. Defaults to false.
 * @param retries - The number of times to retry the command if it fails. Defaults to 0 (no retries).
 * @param hideSuccessMessage - If true, suppresses the success message logging. Defaults to false.
 * @param makeThrow - If true, throws an error on failure after all retries; otherwise, returns undefined. Defaults to true.
 * @returns The output of the executed command, or undefined if not throwing on failure.
 * @throws Will throw an error if the command fails and `makeThrow` is true and retries are exhausted.
 */
export const runCommand = (
  cmd: string,
  cwd: string,
  successMessage: string,
  hideOutput = false,
  retries = 0,
  hideSuccessMessage = false,
  makeThrow = true,
): any => {
  let output;
  try {
    output = cp.execSync(cmd, {
      stdio: hideOutput ? 'pipe' : 'inherit',
      cwd,
    });
    if (!hideSuccessMessage) {
      log.verbose(Colors.BLUE(`running command: ${Colors.WARNING(Colors.BLUE(cmd))}`));
    }
    return output;
  } catch (e: any) {
    const cmdInCwd = `${Colors.BLUE(cmd)} in ${Colors.BLUE(cwd)}`;
    log.verbose(`${Colors.ERROR('error:')} ${Colors.WHITE(cmdInCwd)}`);
    if (!makeThrow) {
      return;
    }

    if (retries <= 0) {
      throw e;
    }
    log.verbose(`retrying command: ${Colors.BLUE(cmd)} in ${Colors.BLUE(cwd)}`);

    return runCommand(cmd, cwd, successMessage, hideOutput, retries - 1, hideSuccessMessage);
  }
};
