import { execSync } from "child-process-es6-promise";
import { log } from "../logger";
import chalk from "chalk";

/**
 * The `runCommand` function executes a command in a specified directory, logs success and error
 * messages, and allows for retries.
 * @param {string} cmd - The `cmd` parameter is a string that represents the command to be executed. It
 * can be any valid command that can be run in the command line.
 * @param {string} cwd - The `cwd` parameter stands for "current working directory". It specifies the
 * directory in which the command should be executed.
 * @param {string} successMessage - The `successMessage` parameter is a string that represents the
 * message to be displayed when the command is executed successfully.
 * @param [hideOutput=false] - A boolean flag indicating whether to hide the output of the command
 * being executed. If set to true, the output will not be displayed in the console. If set to false,
 * the output will be displayed in the console.
 * @param [retries=0] - The `retries` parameter is used to specify the number of times the command
 * should be retried if it fails. If the command fails and the number of retries is greater than 0, the
 * function will recursively call itself with the same parameters, except for the `retries` parameter
 * which will
 * @param [hideSuccessMessage=false] - The `hideSuccessMessage` parameter is a boolean flag that
 * determines whether the success message should be displayed or not. If set to `true`, the success
 * message will be hidden. If set to `false` (default), the success message will be displayed.
 * @returns The function `runCommand` returns the output of the executed command.
 */
export const runCommand = (
  cmd: string,
  cwd: string,
  successMessage: string,
  hideOutput = false,
  retries = 0,
  hideSuccessMessage = false
) => {
  let output;
  try {
    output = execSync(cmd, {
      stdio: hideOutput ? "pipe" : "inherit",
      cwd,
    });
    if (!hideSuccessMessage) {
      log.info(successMessage + chalk.blue(` >  ${cmd}`));
    }
    return output;
  } catch (e) {
    log.error(`Command '${cmd}' exited with error code: ${e.status}`);
    if (retries <= 0) {
      throw e;
    }
    log.info(`Retrying...`);

    return runCommand(
      cmd,
      cwd,
      successMessage,
      hideOutput,
      retries - 1,
      hideSuccessMessage
    );
  }
};
