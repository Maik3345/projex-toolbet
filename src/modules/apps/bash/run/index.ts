import { DirectoryUtils } from '@shared';
import { BashRunCommandUtils } from './utils';

/**
 * The `setupHusky` function sets up Husky, a Git hook tool, in a specified directory or in the current
 * directory.
 * @param options - An object that contains two properties:
 */
export const bashRunCommand = async (
  command: string | undefined,
  options: {
    l?: boolean;
    list: boolean;
  },
) => {
  if (!command) {
    throw new Error('Command is required.');
  }

  const list = options.l || options.list;
  const utils = new BashRunCommandUtils(command);
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.run.bind(utils));
};
