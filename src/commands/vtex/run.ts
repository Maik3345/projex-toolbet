import { Colors } from '@api';
import { vtexRunCommand } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  static description = `Run a command and automatically accept any "Yes/No" questions by default.`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} vtex run`)} 'vtex release minor stable'`,
    `${Colors.PINK(`${CLI_NAME} vtex run`)} 'git status'`,
  ];

  static flags = {
    ...globalFlags,
  };

  static args = {
    command: Args.string({
      description: `Specify the command to run. When using this command, we detect any prompts with the question "Yes/No" and automatically respond with "Yes". If the command finishes with errors, we throw an error to terminate the process.`,
    }),
  };

  async run() {
    const {
      args: { command },
    } = await this.parse(Browse);
    await vtexRunCommand(command);
  }
}
