import { Colors } from '@api';
import { bashRunCommand } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  static description = `Run a shell command in one or more project directories. Perfect for batch operations like install, build, or git commands. Shows clear output and actionable tips if something goes wrong.`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} bash run`)} 'ls -la'   # List files in all directories`,
    `${Colors.PINK(`${CLI_NAME} bash run`)} 'npm install'   # Install dependencies everywhere`,
    `${Colors.PINK(`${CLI_NAME} bash run`)} 'git add . && git commit -m "chore: update" && git push'   # Commit and push in all repos`,
  ];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'Show a list of all detected project folders and select where to run the command.',
      char: 'l',
      default: false,
    }),
  };

  static args = {
    command: Args.string({
      description: `The shell command to execute in each selected directory. Example: ${Colors.GREEN('npm install')}`,
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
