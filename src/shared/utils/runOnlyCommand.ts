import { log } from "../logger";
import { spawn } from "child_process";

/**
 * The `runOnlyCommand` function is a TypeScript function that executes a command and returns a promise
 * that resolves with the output of the command.
 * @param {string} command - The `command` parameter is a string that represents the command you want
 * to run. It can be any valid command that can be executed in a shell environment.
 * @returns The function `runOnlyCommand` returns a Promise that resolves to a string.
 */
export const runOnlyCommand = (command: string): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    // Método para imprimir el log normal
    task.stdout!.on("data", (data: string) => {
      log.debug(data.toString());
      resolve(data.toString());
    });

    // Método para imprimir el log de error
    task.stderr!.on("data", function (data: string) {
      log.debug("Error running the command: " + command);
      log.error(data.toString());
      process.exit(1);
    });
  });
};
