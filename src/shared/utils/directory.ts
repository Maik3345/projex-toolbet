import { Colors, getCurrentDirectory } from '@api';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { log } from '../logger';
import { Folders, IFile } from '../models';

/**
 * Utility class for managing and interacting with directories and files.
 *
 * The `DirectoryUtils` class provides a set of methods for:
 * - Listing directories and files within a given root directory.
 * - Prompting users to select folders or files via interactive prompts.
 * - Filtering files by extension.
 * - Executing asynchronous operations on selected folders.
 * - Formatting and retrieving directory information.
 *
 * This class is designed to streamline common directory and file selection workflows,
 * particularly in CLI tools or scripts that require user interaction for file/folder selection.
 *
 * @example
 * ```typescript
 * const dirUtils = new DirectoryUtils(true);
 * const folders = await dirUtils.getFolders();
 * await dirUtils.runCommandInFolders(folders, async (folderPath) => {
 *   // Perform some async operation on each folder
 * });
 * ```
 *
 * @remarks
 * - The class relies on external dependencies such as `fs`, `path`, `prompts`, and logging utilities.
 * - The `list` property determines whether to prompt for folder selection or use the current directory.
 * - Methods are provided for both synchronous and asynchronous workflows.
 *
 * @public
 */
export class DirectoryUtils {
  private readonly root: string;
  private readonly list: boolean;

  constructor(list?: boolean | undefined) {
    this.root = getCurrentDirectory();
    this.list = list || false;
  }

  /**
   * Prompts the user to select one or more folders from a provided list using a multiselect prompt.
   *
   * @param folderList - An array of `IFile` objects representing the available folders to choose from.
   * @param message - The message to display to the user in the prompt.
   * @returns A promise that resolves to a `Folders` object containing the user's selected folders.
   */
  public chooseFolders = async (folderList: IFile[], message: string): Promise<Folders> => {
    const questions: prompts.PromptObject[] = [
      {
        type: 'multiselect' as const,
        name: 'choices',
        message: message,
        choices: folderList.map((folder) => {
          return {
            title: folder.name,
            value: folder.name,
          };
        }),
      },
    ];

    const response = await prompts(questions);
    return response as Folders;
  };

  /**
   * Retrieves the names of all directories within the specified source path.
   *
   * @param srcpath - The path to the directory whose subdirectories are to be listed.
   * @returns An array of strings, each representing the absolute path of a subdirectory within the given source path.
   */
  public getDirectories = (srcpath: string): Array<string> => {
    return fs
      .readdirSync(srcpath)
      .map((file: any) => path.join(srcpath, file))
      .filter((path: any) => fs.statSync(path).isDirectory());
  };

  /**
   * Retrieves a list of files from the root directory, optionally filtering by file extension.
   *
   * @param extension - The file extension to filter by (e.g., '.txt'). If null or undefined, all files are returned.
   * @returns A promise that resolves to an array of `IFile` objects representing the files in the directory.
   */
  public getFilesInDirectory = async (extension: string | null | undefined): Promise<IFile[]> => {
    let files: IFile[] = [];
    fs.readdirSync(this.root).forEach((file: any) => {
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

  /**
   * Prompts the user to select one or more folders from a given list of files.
   *
   * @param files - An array of `IFile` objects representing the available files/folders to select from.
   * @param message - An optional message to display in the prompt. Defaults to 'Select the files to upload'.
   * @returns A promise that resolves to an array of selected folder choices.
   *
   * @remarks
   * Logs the number of selected folders and provides a tip if none are selected.
   */
  public promptSelectElements = async (files: IFile[], message: string = 'Select the files to upload') => {
    let selection = await this.chooseFolders(files, message);
    const selectedFolders = selection.choices;
    const numSelectedFolders = selectedFolders.length;
    log.info(`${Colors.GREEN('📁 Number of selected folders:')} ${chalk.bold.whiteBright(numSelectedFolders)}`);
    if (numSelectedFolders === 0) {
      log.info(Colors.YELLOW('💡 Tip: Select at least one folder to proceed.'));
    }
    return selectedFolders;
  };

  /**
   * Determines whether the given string ends with the specified suffix.
   *
   * @param str - The string to check.
   * @param suffix - The suffix to look for at the end of the string.
   * @returns `true` if `str` ends with `suffix`, otherwise `false`.
   */
  public endsWith(str: string, suffix: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  /**
   * Returns the current root directory.
   *
   * @returns The current root directory as a string.
   */
  public getCurrentDirectory = () => {
    return this.root;
  };

  /**
   * Returns an array containing a single formatted `IFile` object representing the current directory.
   *
   * The returned `IFile` object includes the directory's name (extracted from the path)
   * and its full path.
   *
   * @returns {IFile[]} An array with one `IFile` object for the current directory.
   */
  public getCurrentDirectoryFormatted = (): IFile[] => {
    const directory = this.getCurrentDirectory();
    const currentDirectory: IFile = {
      name: directory.split('/').pop() as string,
      path: directory,
    };
    return [currentDirectory];
  };

  /**
   * Asynchronously retrieves the list of folder directories from the root path,
   * prompts the user to select one or more folders, and returns the selected folders.
   *
   * @returns {Promise<IFile[]>} A promise that resolves to an array of selected folder objects,
   * each containing the folder's name and path.
   *
   * @throws Will propagate any errors thrown by `getDirectories` or `promptSelectElements`.
   */
  public getFolderDirectories = async () => {
    const directories = this.getDirectories(this.root);

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

  /**
   * Returns an array of files from the provided list that match the given selection of file names.
   *
   * @param files - The array of `IFile` objects to search within.
   * @param selected - The array of file names to select from the `files` array.
   * @returns An array of `IFile` objects whose `name` property matches any of the names in the `selected` array.
   */
  getSelectedElements(files: IFile[], selected: string[]) {
    let toUpload: IFile[] = [];
    files.forEach((item) => {
      selected.forEach((sItem) => {
        if (item.name == sItem) {
          toUpload.push(item);
        }
      });
    });
    return toUpload;
  }

  /**
   * Retrieves folder information based on the `list` property.
   *
   * - If `list` is `true`, asynchronously fetches and returns the directories using `getFolderDirectories()`.
   * - If `list` is `false`, returns the formatted current directory using `getCurrentDirectoryFormatted()`.
   *
   * @returns {Promise<any>} A promise that resolves to the list of folder directories or the formatted current directory.
   */
  async getFolders() {
    return this.list ? await this.getFolderDirectories() : this.getCurrentDirectoryFormatted();
  }

  /**
   * Executes an asynchronous method on each provided folder in parallel.
   *
   * Iterates over the given array of folders, skipping any that are `undefined`.
   * For each valid folder, logs the start and completion of the operation,
   * and invokes the provided asynchronous `method` with the folder's path.
   * All operations are executed concurrently.
   *
   * @param folders - An array of `IFile` objects or `undefined` values representing the folders to process.
   * @param method - An asynchronous function that takes a folder path as a string and returns a `Promise<void>`.
   * @returns A `Promise` that resolves when all folder operations have completed.
   */
  async runCommandInFolders(folders: (IFile | undefined)[], method: (root: string) => Promise<void>) {
    const folderOperations = folders.map(async (folder) => {
      if (!folder) {
        log.warn(Colors.WARNING('⚠️ Skipping undefined folder.'));
        return;
      }

      log.info(`${Colors.BLUE('🔧 Setting up for:')} ${Colors.PINK(folder.name)}`);
      await method(folder.path);
      log.info(`${Colors.GREEN('✅ Setup complete for:')} ${Colors.PINK(folder.name)}`);
    });

    await Promise.all(folderOperations);
  }
}
