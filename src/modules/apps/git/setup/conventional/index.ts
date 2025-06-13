import { DirectoryUtils } from '@shared';
import { SetupConventionalUtil } from './utils';

/**
 * The `setupConventional` function sets up conventional commits environment with Husky and Commitlint
 * in a specified directory or in the current directory, and creates a CHANGELOG.md file.
 * @param options - An object that contains two properties:
 */
export const setupConventional = async (options: { l?: boolean; list: boolean }) => {
  const list = options.l || options.list;
  const utils = new SetupConventionalUtil();
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupConventional.bind(utils));
};
