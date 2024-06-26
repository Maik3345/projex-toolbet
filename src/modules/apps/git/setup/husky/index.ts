import { DirectoryUtils } from '@shared';
import { SetupHuskyUtil } from './utils';

/**
 * The `setupHusky` function sets up Husky, a Git hook tool, in a specified directory or in the current
 * directory.
 * @param options - An object that contains two properties:
 */
export const setupHusky = async (options: { l?: boolean; list: boolean }) => {
  const list = options.l || options.list;
  const utils = new SetupHuskyUtil();
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.setupHusky.bind(utils));
};
