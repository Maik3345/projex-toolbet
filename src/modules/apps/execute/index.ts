import { log } from "../../../shared";
import { childProcessRunCommandRun } from "./util/child-process-run";

let commandToUse = "";

export default async function (command: string) {
  if (command === undefined) {
    throw new Error("no command to execute");
  }

  // Capturo el flag para saber si empleo la ultima versión siempre o no.
  const SCAPECOMMAND = "--scape";
  const scapeCommand = process.argv.indexOf(SCAPECOMMAND) >= 0;
  commandToUse = command;

  if (scapeCommand) {
    commandToUse = command.replace(/\@S+/g, " ");
    commandToUse = commandToUse.replace(/\@AND+/g, "&&");
  }

  log.debug(`Command to execute: ${commandToUse}`);
  log.info("Loading execute component process");
  executeCommand();
}

const executeCommand = () => {
  log.debug(`Command to execute: ${commandToUse}`);
  childProcessRunCommandRun(commandToUse);
};
