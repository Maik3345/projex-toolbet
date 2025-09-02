import { Colors, getCurrentDirectory } from '@api';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { log } from '../../logger';
import { Folders, IFile } from '../../models';

export class DirectoryUtils {
  private readonly root: string;
  private readonly list: boolean;

  constructor(list?: boolean | undefined) {
    this.root = getCurrentDirectory();
    this.list = list || false;
  }

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

  public getDirectories = (srcpath: string): Array<string> => {
    return fs
      .readdirSync(srcpath)
      .map((file: any) => path.join(srcpath, file))
      .filter((path: any) => fs.statSync(path).isDirectory());
  };

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

  public promptSelectElements = async (files: IFile[], message: string = 'Select the files to upload') => {
    let selection = await this.chooseFolders(files, message);
    const selectedFolders = selection.choices;
    const numSelectedFolders = selectedFolders.length;
    log.info(`${Colors.GREEN('📁 Number of selected folders:')} ${Colors.WHITE(numSelectedFolders.toString())}`);
    if (numSelectedFolders === 0) {
      log.info(Colors.YELLOW('💡 Tip: Select at least one folder to proceed.'));
    }
    return selectedFolders;
  };

  public endsWith(str: string, suffix: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  public getCurrentDirectory = () => {
    return this.root;
  };

  public getCurrentDirectoryFormatted = (): IFile[] => {
    const directory = this.getCurrentDirectory();
    const currentDirectory: IFile = {
      name: directory.split('/').pop() as string,
      path: directory,
    };
    return [currentDirectory];
  };

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

  async getFolders() {
    return this.list ? await this.getFolderDirectories() : this.getCurrentDirectoryFormatted();
  }

  async runCommandInFolders(folders: (IFile | undefined)[], method: (root: string) => Promise<void>) {
    const folderOperations = folders.map(async (folder) => {
      if (!folder) {
        log.warn(Colors.WARNING('⚠️ Skipping undefined folder.'));
        return;
      }

      await method(folder.path);
    });

    await Promise.all(folderOperations);
  }
}
