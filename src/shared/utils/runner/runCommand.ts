const cp = require('child-process-es6-promise');
import { Colors } from '@api';
import { log } from '@shared';

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
