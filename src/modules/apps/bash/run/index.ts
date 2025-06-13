import { DirectoryUtils, log } from '@shared';
import { BashRunCommandUtils } from './utils';
import { Colors } from '@api';
/**
 * The `bashRunCommand` function runs a specified bash command in all folders of the current directory
 * or in the selected folders, depending on the options provided.
 * @param command - The bash command to run.
 * @param options - An object that contains two properties:
 *   - `l` or `list`: If true, lists all projects to select for running the command.
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
