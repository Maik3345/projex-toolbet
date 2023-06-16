import inquirer = require("inquirer");
import chalk from "chalk";
import { IFile } from "../../shared";

interface Folders {
  folders: Array<string>;
}

export const chooseFolders = async (
  folderList: IFile[],
  message: string,
  action: string
): Promise<Folders> => {
  let folders = [
    new inquirer.Separator(`${chalk.whiteBright(action)} \n`),
    ...folderList,
  ];

  const promptCommands: Folders = await inquirer.prompt([
    {
      type: "checkbox",
      message: `${chalk.redBright(message)}`,
      name: "folders",
      choices: folders,
    },
  ]);
  return promptCommands;
};
