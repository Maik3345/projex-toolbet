import { accessSync } from 'fs';
const path = require('path');

export const MANIFEST_FILE_NAME = 'manifest.json';
export const PACKAGE_FILE_NAME = 'package.json';

const fileExists = (filePath: string) => {
  try {
    accessSync(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getAppRoot = () => {
  if (process.env.OCLIF_COMPILATION) {
    return '';
  }

  const cwd = process.cwd();
  const { root: rootDirName } = path.parse(cwd);

  const find = (dir: string): string => {
    const manifestPath = path.join(dir, MANIFEST_FILE_NAME);
    const packagePath = path.join(dir, PACKAGE_FILE_NAME);

    if (fileExists(manifestPath) || fileExists(packagePath)) {
      return dir;
    } else {
      if (dir === rootDirName) {
        throw new Error(
          "Manifest or package file doesn't exist or is not readable. Please make sure you're in the app's directory or add the required files in the root folder of the app.",
        );
      }
      return find(path.resolve(dir, '..'));
    }
  };

  return find(cwd);
};
