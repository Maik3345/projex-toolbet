import { DirectoryUtils } from '@shared';
import { SetupGitRepositoryUtils } from './utils';

export const setupGitRepository = async (options: { l?: boolean; list?: boolean }) => {
  const list = options.l !== undefined ? options.l : options.list;
  const utils = new SetupGitRepositoryUtils();
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupGitRepository.bind(utils));
};
