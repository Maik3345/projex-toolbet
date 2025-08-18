import { DirectoryUtils } from '@shared';
import { SetupConventionalUtil } from './utils';

/**
 * Sets up conventional configuration in multiple directories.
 *
 * This function initializes utilities and directory helpers, retrieves a list of folders,
 * and runs the conventional setup command in each folder.
 *
 * @param options - An object containing options for the setup.
 * @param options.l - Optional shorthand flag to enable listing mode.
 * @param options.list - Flag to enable listing mode.
 * @returns A promise that resolves when the setup is complete.
 */
export const setupConventional = async (options: { l?: boolean; list: boolean }) => {
  const list = options.l || options.list;
  const utils = new SetupConventionalUtil();
  const directory = new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupConventional.bind(utils));
};
