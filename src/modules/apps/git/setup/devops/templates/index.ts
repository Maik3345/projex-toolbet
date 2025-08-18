import { DirectoryUtils } from '@shared';
import { SetupDevopsTemplatesUtils } from './utils';

/**
 * Sets up DevOps templates in multiple directories.
 *
 * This function initializes utility classes and retrieves a list of folders,
 * then runs the DevOps template setup command in each folder.
 *
 * @param options - An object containing options for the setup process.
 * @param options.l - Optional boolean flag to indicate listing mode.
 * @param options.list - Optional boolean flag to indicate listing mode (alternative to `l`).
 * @returns A promise that resolves when the setup process is complete.
 */
export const setupDevopsTemplates = async (options: { l?: boolean; list?: boolean }) => {
  const list = options.l ?? options.list;
  const utils = new SetupDevopsTemplatesUtils();
  const directory = new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupDevopsTemplates.bind(utils));
};
