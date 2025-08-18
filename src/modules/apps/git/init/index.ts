import { DirectoryUtils } from '@shared';
import { SetupGitRepositoryUtils } from './utils';

/**
 * Sets up a Git repository in multiple folders.
 *
 * This function initializes Git repositories in all directories returned by `DirectoryUtils.getFolders()`.
 * It uses the `SetupGitRepositoryUtils` to perform the setup in each folder.
 *
 * @param options - Options for the setup process.
 * @param options.l - If true, enables listing mode (alternative to `list`).
 * @param options.list - If true, enables listing mode (alternative to `l`).
 *
 * @returns A promise that resolves when the setup is complete.
 */
export const setupGitRepository = async (options: { l?: boolean; list?: boolean }) => {
  const list = options.l ?? options.list;
  const utils = new SetupGitRepositoryUtils();
  const directory = new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupGitRepository.bind(utils));
};
