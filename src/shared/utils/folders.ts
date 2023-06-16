import chalk from "chalk";
import { chooseFolders, IFile, log } from "../../shared";
const path = require("path");
const fs = require("fs");

// Method that returns an array with the directories found
export const getDirectories = (srcpath: string): Promise<Array<string>> => {
  return fs
    .readdirSync(srcpath)
    .map((file: any) => path.join(srcpath, file))
    .filter((path: any) => fs.statSync(path).isDirectory());
};

// Method that returns an array with the found files
export const getFilesInDirectory = async (
  srcpath: string,
  extension: string | null
): Promise<IFile[]> => {
  let files: IFile[] = [];
  await fs.readdirSync(srcpath).map((file: any) => {
    if (extension != null) {
      if (endsWith(file, extension)) {
        files.push({
          name: file,
          path: path.join(srcpath, file),
        });
      }
    } else {
      files.push({
        name: file,
        path: path.join(srcpath, file),
      });
    }
  });
  return files;
};

// Method that paints a list to select past files
export const selectFiles = async (files: IFile[]) => {
  let choose = await chooseFolders(
    files,
    "Select the files to upload",
    "Select the project"
  );
  log.info(
    `Total of files to use: ${chalk.whiteBright(`${choose.folders.length}`)}`
  );
  return choose.folders;
};

function endsWith(str: string, suffix: string) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
