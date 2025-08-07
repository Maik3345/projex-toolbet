import { Colors } from '@api';
import { bashRunCommand } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  static description = `Run a command in the current directory or select multiple directories`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} bash run`)} 'git add . && git push'`,
    `${Colors.PINK(`${CLI_NAME} bash run`)} 'npm install'`,
  ];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'List all projects before running the command.',
      char: 'l',
      default: false,
    }),
  };

  static args = {
    command: Args.string({
      description: `Specify the command to run. For example: ${Colors.GREEN('git add . && git push')}`,
    }),
  };

  async run() {
    const {
      flags: { list },
      args: { command },
    } = await this.parse(Browse);
    await bashRunCommand(command, { list });
  }
}
