const inquirer = require('inquirer');
import { Colors, getCurrentDirectory } from '@api';
import { log } from '../logger';
import { Folders, IFile } from '../models';
import chalk from 'chalk';
const path = require('path');
const fs = require('fs');

export class DirectoryUtils {
  private root: string;
  private list: boolean;

  constructor(list?: boolean | undefined) {
    this.root = getCurrentDirectory();
    this.list = list ? list : false;
  }

  /* The `chooseFolders` method is a public method of the `DirectoryUtils` class. It takes in three
  parameters: `folderList`, which is an array of `IFile` objects representing the list of folders to
  choose from, `message`, which is a string representing the message to display to the user, and
  `action`, which is a string representing the action being performed. */
  public chooseFolders = async (folderList: IFile[], message: string, action: string): Promise<Folders> => {
    let folders = [new inquirer.Separator(`${chalk.whiteBright(action)} \n`), ...folderList];

    const promptCommands: Folders = await inquirer.prompt([
      {
        type: 'checkbox',
        message: `${chalk.redBright(message)}`,
        name: 'folders',
        choices: folders,
      },
    ]);
    return promptCommands;
  };

  /* The `getDirectories` method is a public method of the `DirectoryUtils` class. It takes in a `srcpath`
  parameter, which is a string representing the path of the directory to search for subdirectories. */
  public getDirectories = (srcpath: string): Promise<Array<string>> => {
    return fs
      .readdirSync(srcpath)
      .map((file: any) => path.join(srcpath, file))
      .filter((path: any) => fs.statSync(path).isDirectory());
  };

  /* The `getFilesInDirectory` method is a public method of the `DirectoryUtils` class. It takes in two
  parameters: `srcpath`, which is a string representing the path of the directory to search for
  files, and `extension`, which is a string or null representing the file extension to filter the
  files by. */
  public getFilesInDirectory = async (extension: string | null | undefined): Promise<IFile[]> => {
    let files: IFile[] = [];
    await fs.readdirSync(this.root).map((file: any) => {
      if (extension != null && extension != undefined) {
        if (this.endsWith(file, extension)) {
          files.push({
            name: file,
            path: path.join(this.root, file),
          });
        }
      } else {
        files.push({
          name: file,
          path: path.join(this.root, file),
        });
      }
    });
    return files;
  };

  /* The `promptSelectElements` method is a public method of the `DirectoryUtils` class. It takes in an
  array of `IFile` objects (`files`), a message string (default value is "Select the files to
  upload"), and an action string (default value is "Select the project"). */
  public promptSelectElements = async (
    files: IFile[],
    message: string = 'Select the files to upload',
    action: string = 'Select the project',
  ) => {
    let choose = await this.chooseFolders(files, message, action);
    const selectedFolders = choose.folders;
    const numSelectedFolders = selectedFolders.length;
    log.info(`number of selected folders: ${chalk.bold.whiteBright(numSelectedFolders)}`);
    return selectedFolders;
  };

  /**
   * The function checks if a string ends with a specific suffix.
   * @param {string} str - The `str` parameter is a string that represents the main string we want to
   * check if it ends with a specific suffix.
   * @param {string} suffix - The "suffix" parameter is a string that represents the ending portion of
   * the "str" string. The function checks if the "str" string ends with the "suffix" string.
   * @returns a boolean value. It returns true if the given string ends with the specified suffix, and
   * false otherwise.
   */
  public endsWith(str: string, suffix: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  /* The `getCurrentDirectory` method is a public method that returns the value of the `root` property.
  The `root` property is set in the constructor of the `DirectoryUtils` class and represents the
  current directory. So, when the `getCurrentDirectory` method is called, it simply returns the
  current directory. */
  public getCurrentDirectory = () => {
    return this.root;
  };

  /**
   * The function getCurrentDirectory returns an array containing an object with the name and path of
   * the current directory.
   * @returns An array containing an object with the name and path of the current directory.
   */
  public getCurrentDirectoryFormatted = (): IFile[] => {
    const directory = this.getCurrentDirectory();
    const currentDirectory: IFile = {
      name: directory.split('/').pop() as string,
      path: directory,
    };
    return [currentDirectory];
  };

  /* The `getFolderDirectories` method is a function that retrieves all the directories within the
 current directory. It uses the `getDirectories` method to get a list of directories, and then maps
 over each directory to create an array of `IFile` objects. Each `IFile` object contains the name of
 the directory (obtained by splitting the directory path and getting the last element) and the full
 path of the directory. */
  public getFolderDirectories = async () => {
    const directories = await this.getDirectories(this.root);

    const folders: IFile[] = directories.map((directory) => {
      return {
        name: directory.split('/').pop(),
        path: directory,
      } as IFile;
    });

    const selected = await this.promptSelectElements(folders);

    return selected.map((folder) => {
      return folders.find((item) => item.name === folder);
    });
  };

  // Filter the original array with the string array and get only the element selected
  getSelectedElements(files: IFile[], selected: string[]) {
    let toUpload: IFile[] = [];
    files.map((item) => {
      selected.map((sItem) => {
        if (item.name == sItem) {
          toUpload.push(item);
        }
      });
    });
    return toUpload;
  }

  async getFolders() {
    return this.list ? await this.getFolderDirectories() : this.getCurrentDirectoryFormatted();
  }

  async runCommandInFolders(folders: (IFile | undefined)[], method: (root: string) => Promise<void>) {
    const setupHusky = folders.map(async (folder) => {
      if (!folder) {
        return;
      }

      log.info(`setting up for: ${Colors.PINK(folder.name)}`);
      await method(folder.path);
      log.info(`setup complete for: ${Colors.PINK(folder.name)}`);
    });

    await Promise.all(setupHusky);
  }
}
