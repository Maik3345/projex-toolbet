import { log } from "../logger";
import { spawn } from "child_process";

/**
 * The `runMultipleCommand` function executes a command in the shell and returns a promise that
 * resolves when the command exits, while also logging the output and handling any errors.
 * @param {string} command - The `command` parameter is a string that represents the command you want
 * to run. It can be any valid command that can be executed in a shell environment.
 * @param [errors] - The `errors` parameter is an optional array of strings. It is used to specify
 * specific error messages that should cause the process to exit with a non-zero status code. If any of
 * the error messages are found in the stderr output of the command being executed, the process will
 * exit with a status code
 * @returns The function `runMultipleCommand` returns a Promise that resolves to a string.
 */
export const runMultipleCommand = (
  command: string,
  errors?: Array<string>
): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    // Método para imprimir el log normal
    task.stdout!.on("data", (data: string) => {
      log.info(data.toString());
    });

    task.on("exit", () => {
      resolve("exit");
    });

    // Método para imprimir el log de error
    task.stderr!.on("data", (data: string) => {
      log.warn(data.toString());

      if (errors) {
        errors.map((item: string) => {
          if (data.toString().includes(item)) {
            process.exit(1);
          }
        });
      }
    });
  });
};
