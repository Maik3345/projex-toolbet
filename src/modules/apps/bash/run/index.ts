import { DirectoryUtils, log } from '@shared';
import { BashRunCommandUtils } from './utils';
import { Colors } from '@api';

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
    log.error(Colors.ERROR('please provide a command to run'));
    process.exit(1);
  }

  const list = options.l || options.list;
  const utils = new BashRunCommandUtils(command);
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.run.bind(utils));
};
