import { Colors } from '@api';
import { vtexRunScript } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Browse extends Command {
  static description = `Run a script from the package.json or the manifest.json file. If the script is not found, we throw a warning.`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} vtex run`)} 'vtex release minor stable'`,
    `${Colors.PINK(`${CLI_NAME} vtex run`)} 'git status'`,
  ];

  static flags = {
    ...globalFlags,
  };

  static args = {
    script: Args.string({
      description: `Specify the script to run.`,
    }),
  };

  async run() {
    const {
      args: { script },
    } = await this.parse(Browse);
    vtexRunScript(script);
  }
}
