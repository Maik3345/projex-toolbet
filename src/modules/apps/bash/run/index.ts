import { Colors } from '@api';
import { DirectoryUtils, log } from '@shared';
import { BashRunCommandUtils } from './utils';

/**
 * Executes a specified bash command across multiple directories.
 *
 * @param command - The bash command to execute. If not provided, the process will exit with an error message.
 * @param options - An object containing options for command execution.
 * @param options.l - Optional. If true, enables listing mode.
 * @param options.list - If true, enables listing mode. Used as a fallback if `l` is not provided.
 *
 * @remarks
 * - If no command is provided, an error is logged and the process exits.
 * - The command is executed in all directories returned by `DirectoryUtils.getFolders()`.
 * - Uses `BashRunCommandUtils` to handle command execution logic.
 */
export const bashRunCommand = async (
  command: string | undefined,
  options: {
    l?: boolean;
    list: boolean;
  },
) => {
  if (!command) {
    log.error(Colors.ERROR('❌ No command provided. Please specify a bash command to run.'));
    log.info(Colors.YELLOW('💡 Tip: Example usage: projex bash run "ls -la"'));
    process.exit(1);
  }

  const list = options.l || options.list;
  const utils = new BashRunCommandUtils(command);
  const directory = new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(folders, utils.run.bind(utils));
};
